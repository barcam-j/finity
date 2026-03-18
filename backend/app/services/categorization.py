import re
import unicodedata

from beanie import PydanticObjectId

# Generic banking prefix words that are NOT merchant names and should be skipped.
_SKIP_TOKENS = {
    'compra', 'recibo', 'cargo', 'pago', 'ingreso', 'abono', 'cobro',
    'transferencia', 'reintegro', 'retiro', 'comision', 'cuota', 'liquidacion',
    'purchase', 'payment', 'transfer', 'charge', 'fee',
}

_MIN_LETTERS = 4


def _desc_key(description: str) -> str:
    """Extract the first meaningful merchant word from a transaction description."""
    s = description.strip().lower()
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'[^\w\s]', ' ', s)

    for raw in s.split():
        letters = re.sub(r'[^a-z]', '', raw)
        if len(letters) >= _MIN_LETTERS and letters not in _SKIP_TOKENS:
            return letters

    return ''


def descriptions_match(desc1: str, desc2: str) -> bool:
    key1 = _desc_key(desc1)
    key2 = _desc_key(desc2)
    if not key1 or not key2:
        return False
    return key1 == key2


async def save_rule(user_id: PydanticObjectId, category: str, pattern: str) -> None:
    """Persist a categorization rule if it doesn't already exist."""
    from app.models.category_rule import CategoryRule
    if not pattern:
        return
    exists = await CategoryRule.find_one(
        CategoryRule.user_id == user_id,
        CategoryRule.category == category,
        CategoryRule.pattern == pattern,
    )
    if not exists:
        await CategoryRule(user_id=user_id, category=category, pattern=pattern).insert()


async def _get_rules_map(user_id: PydanticObjectId) -> dict[str, set[str]]:
    """Load all rules for a user as a dict: pattern -> set of categories."""
    from app.models.category_rule import CategoryRule
    rules = await CategoryRule.find(CategoryRule.user_id == user_id).to_list()
    result: dict[str, set[str]] = {}
    for r in rules:
        result.setdefault(r.pattern, set()).add(r.category)
    return result


async def apply_rules_to_imported(user_id: PydanticObjectId, new_transactions: list) -> int:
    """Apply learned categorization rules to a list of transactions before they are inserted.

    Modifies the transaction objects in place. No database writes per transaction.
    Returns the number of transactions that were auto-categorized.
    """
    rules_map = await _get_rules_map(user_id)
    if not rules_map:
        return 0

    count = 0
    for t in new_transactions:
        key = _desc_key(t.description)
        if not key or key not in rules_map:
            continue
        cats_to_add = [c for c in rules_map[key] if c not in t.categories]
        if cats_to_add:
            t.categories = list(t.categories) + cats_to_add
            count += 1

    return count
