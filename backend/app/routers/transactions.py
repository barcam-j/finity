import unicodedata
from datetime import date as DateType

from fastapi import APIRouter, Depends, HTTPException, Query, status
from beanie import PydanticObjectId
from beanie.odm.enums import SortDirection
from pydantic import BaseModel

from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.services.categorization import descriptions_match, save_rule, _desc_key

router = APIRouter(prefix='/transactions', tags=['transactions'])


class TransactionUpdate(BaseModel):
    date: DateType | None = None
    description: str | None = None
    categories: list[str] | None = None
    amount: float | None = None
    note: str | None = None
    save_rule: bool = True


class BulkCategoryUpdate(BaseModel):
    ids: list[str]
    category: str | None = None


class DuplicateCheckItem(BaseModel):
    date: DateType
    amount: float
    description: str


class DuplicateCheckRequest(BaseModel):
    transactions: list[DuplicateCheckItem]


def _cat_key(s: str) -> str:
    """Normalize a category name for duplicate detection: strip, lowercase, remove accents."""
    s = s.strip().lower()
    s = unicodedata.normalize('NFKD', s)
    return ''.join(c for c in s if not unicodedata.combining(c))


def _tx_out(t: Transaction) -> dict:
    return t.model_dump(mode='json', by_alias=False)


async def _normalize_categories(user_id: PydanticObjectId, new_cats: list[str]) -> list[str]:
    """Map each category to an existing one with same key (no accent, no case), or keep as-is."""
    all_txs = await Transaction.find(Transaction.user_id == user_id).to_list()
    existing: set[str] = {c for t in all_txs for c in t.categories}
    result = []
    seen: set[str] = set()
    for cat in new_cats:
        key = _cat_key(cat)
        if key in seen:
            continue
        seen.add(key)
        match = next((e for e in existing if _cat_key(e) == key), cat)
        result.append(match)
    return result


async def _auto_categorize(user_id: PydanticObjectId, source_tx: Transaction, added_categories: list[str]) -> int:
    """Apply added_categories to all transactions of this user whose description matches source_tx."""
    if not added_categories:
        return 0
    all_txs = await Transaction.find(Transaction.user_id == user_id).to_list()
    count = 0
    for t in all_txs:
        if t.id == source_tx.id:
            continue
        if not descriptions_match(source_tx.description, t.description):
            continue
        changed = False
        for cat in added_categories:
            already = any(_cat_key(c) == _cat_key(cat) for c in t.categories)
            if not already:
                t.categories = t.categories + [cat]
                changed = True
        if changed:
            await t.replace()
            count += 1
    return count


@router.get('/categories')
async def list_categories(current_user: User = Depends(get_current_user)):
    transactions = await Transaction.find(
        Transaction.user_id == current_user.id,
    ).to_list()
    all_cats: set[str] = set()
    for t in transactions:
        all_cats.update(t.categories)
    return sorted(all_cats)


@router.get('/')
async def list_transactions(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    categories: list[str] = Query(default=[]),
    date_from: DateType | None = Query(None),
    date_to: DateType | None = Query(None),
    amount_min: float | None = Query(None),
    amount_max: float | None = Query(None),
):
    conditions = [Transaction.user_id == current_user.id]

    if search and search.strip():
        conditions.append({'description': {'$regex': search.strip(), '$options': 'i'}})

    if categories:
        conditions.append({'categories': {'$in': categories}})

    if date_from:
        conditions.append(Transaction.date >= date_from)

    if date_to:
        conditions.append(Transaction.date <= date_to)

    if amount_min is not None:
        conditions.append(Transaction.amount >= amount_min)

    if amount_max is not None:
        conditions.append(Transaction.amount <= amount_max)

    query = Transaction.find(*conditions)
    total = await query.count()
    items = await query.sort(
        [('date', SortDirection.DESCENDING), ('_id', SortDirection.ASCENDING)]
    ).skip((page - 1) * limit).limit(limit).to_list()
    return {
        'items': [_tx_out(t) for t in items],
        'total': total,
        'page': page,
        'pages': max(1, -(-total // limit)),
    }


@router.patch('/{transaction_id}')
async def update_transaction(
    transaction_id: PydanticObjectId,
    body: TransactionUpdate,
    current_user: User = Depends(get_current_user),
):
    transaction = await Transaction.get(transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Transaction not found')

    categories_changed = body.categories is not None
    old_categories = list(transaction.categories)

    if body.date is not None:
        transaction.date = body.date
    if body.description is not None:
        transaction.description = body.description
    if body.amount is not None:
        transaction.amount = body.amount
    if body.categories is not None:
        transaction.categories = await _normalize_categories(current_user.id, body.categories)
    if body.note is not None:
        transaction.note = body.note if body.note.strip() else None
    await transaction.replace()

    auto_categorized = 0
    if categories_changed:
        added = [c for c in transaction.categories if not any(_cat_key(c) == _cat_key(o) for o in old_categories)]
        if body.save_rule and added:
            pattern = _desc_key(transaction.description)
            for cat in added:
                await save_rule(current_user.id, cat, pattern)
            auto_categorized = await _auto_categorize(current_user.id, transaction, added)

    return {'transaction': _tx_out(transaction), 'auto_categorized': auto_categorized}


@router.post('/bulk-category')
async def bulk_update_category(
    body: BulkCategoryUpdate,
    current_user: User = Depends(get_current_user),
):
    updated = 0
    processed_txs: list[Transaction] = []
    for id_str in body.ids:
        try:
            transaction = await Transaction.get(PydanticObjectId(id_str))
            if transaction and transaction.user_id == current_user.id:
                if body.category:
                    existing = next((c for c in transaction.categories if _cat_key(c) == _cat_key(body.category)), None)
                    if not existing:
                        transaction.categories = transaction.categories + [body.category]
                    await transaction.replace()
                    processed_txs.append(transaction)
                updated += 1
        except Exception:
            continue

    auto_categorized = 0
    if body.category:
        for tx in processed_txs:
            await save_rule(current_user.id, body.category, _desc_key(tx.description))
            auto_categorized += await _auto_categorize(current_user.id, tx, [body.category])

    return {'updated': updated, 'auto_categorized': auto_categorized}


@router.get('/deduplicate/preview')
async def preview_duplicates(
    current_user: User = Depends(get_current_user),
    search: str | None = Query(None),
):
    transactions = await Transaction.find(Transaction.user_id == current_user.id).to_list()

    if search:
        matches = [t for t in transactions if search.lower() in t.description.lower()]
        return {
            'matches': [
                {
                    'id': str(t.id),
                    'date': t.date.isoformat(),
                    'amount': t.amount,
                    'amount_raw': repr(t.amount),
                    'description': t.description,
                    'description_repr': repr(t.description),
                    'description_len': len(t.description),
                }
                for t in matches
            ]
        }

    groups: dict[tuple, list] = {}
    for t in transactions:
        key = (t.date.isoformat(), round(t.amount, 2), t.description.strip().lower())
        groups.setdefault(key, []).append({
            'id': str(t.id),
            'date': t.date.isoformat(),
            'amount': t.amount,
            'description': t.description,
            'description_repr': repr(t.description),
        })
    duplicates = {str(k): v for k, v in groups.items() if len(v) > 1}
    return {'total_transactions': len(transactions), 'duplicate_groups': len(duplicates), 'groups': duplicates}


@router.post('/deduplicate')
async def deduplicate_transactions(current_user: User = Depends(get_current_user)):
    transactions = await Transaction.find(Transaction.user_id == current_user.id).to_list()

    seen: set[tuple] = set()
    to_delete: list[Transaction] = []

    for t in sorted(transactions, key=lambda x: x.id.generation_time):
        key = (t.date.isoformat(), round(t.amount, 2), t.description.strip().lower())
        if key in seen:
            to_delete.append(t)
        else:
            seen.add(key)

    for t in to_delete:
        await t.delete()

    return {'deleted': len(to_delete)}


@router.post('/check-duplicates')
async def check_duplicates(
    body: DuplicateCheckRequest,
    current_user: User = Depends(get_current_user),
):
    if not body.transactions:
        return {'duplicate_indices': []}

    dates = list({t.date for t in body.transactions})
    existing = await Transaction.find(
        Transaction.user_id == current_user.id,
        {'date': {'$in': dates}},
    ).to_list()

    existing_keys: set[tuple] = {
        (t.date.isoformat(), round(t.amount, 2), t.description.strip().lower())
        for t in existing
    }

    duplicate_indices = [
        i for i, t in enumerate(body.transactions)
        if (t.date.isoformat(), round(t.amount, 2), t.description.strip().lower()) in existing_keys
    ]

    return {'duplicate_indices': duplicate_indices}


@router.delete('/{transaction_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: PydanticObjectId,
    current_user: User = Depends(get_current_user),
):
    transaction = await Transaction.get(transaction_id)
    if not transaction or transaction.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Transaction not found')
    await transaction.delete()
