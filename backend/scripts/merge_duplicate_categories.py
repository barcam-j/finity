"""
Migration script: merge duplicate categories (case-insensitive) across all transactions.

For each user, groups all distinct category names by their lowercase form.
Within each group, keeps the most-used variant and replaces all others with it.
Prints a summary of changes before applying them and asks for confirmation.

Usage:
    cd backend
    python scripts/merge_duplicate_categories.py
"""

import asyncio
import unicodedata
from collections import defaultdict

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models.transaction import Transaction
from app.models.user import User


def _cat_key(s: str) -> str:
    s = s.strip().lower()
    s = unicodedata.normalize('NFKD', s)
    return ''.join(c for c in s if not unicodedata.combining(c))


async def main() -> None:
    client = AsyncIOMotorClient(settings.mongodb_url)
    await init_beanie(
        database=client[settings.database_name],
        document_models=[Transaction, User],
    )

    users = await User.find_all().to_list()
    total_updated = 0

    for user in users:
        transactions = await Transaction.find(Transaction.user_id == user.id).to_list()

        # Count occurrences of each category variant per user
        counts: dict[str, int] = defaultdict(int)
        for t in transactions:
            for c in t.categories:
                counts[c] += 1

        # Group variants by normalized key (no case, no accents, no extra spaces)
        groups: dict[str, list[str]] = defaultdict(list)
        for cat in counts:
            groups[_cat_key(cat)].append(cat)

        # Build mapping: variant -> canonical (most used variant in the group)
        remap: dict[str, str] = {}
        for variants in groups.values():
            if len(variants) == 1:
                continue
            canonical = max(variants, key=lambda v: counts[v])
            for v in variants:
                if v != canonical:
                    remap[v] = canonical

        if not remap:
            continue

        print(f'\nUser {user.email}:')
        for old, new in remap.items():
            print(f'  "{old}" -> "{new}"')

        answer = input('\nApply these changes? [y/N] ').strip().lower()
        if answer != 'y':
            print('Skipped.')
            continue

        for t in transactions:
            new_cats = []
            changed = False
            seen_lower: set[str] = set()
            for c in t.categories:
                canonical = remap.get(c, c)
                lower = canonical.lower()
                if lower in seen_lower:
                    changed = True
                    continue
                seen_lower.add(lower)
                if canonical != c:
                    changed = True
                new_cats.append(canonical)

            if changed:
                t.categories = new_cats
                await t.replace()
                total_updated += 1

        print(f'Done. {total_updated} transaction(s) updated so far.')

    print(f'\nMigration complete. Total transactions updated: {total_updated}')
    client.close()


if __name__ == '__main__':
    asyncio.run(main())
