import re
import unicodedata

# Generic banking prefix words that are NOT merchant names and should be skipped
# when looking for the first meaningful token.
_SKIP_TOKENS = {
    'compra', 'recibo', 'cargo', 'pago', 'ingreso', 'abono', 'cobro',
    'transferencia', 'reintegro', 'retiro', 'comision', 'cuota', 'liquidacion',
    'purchase', 'payment', 'transfer', 'charge', 'fee',
}

# A token must have at least this many letters (after stripping digits) to count.
_MIN_LETTERS = 4


def _desc_key(description: str) -> str:
    """Extract the first meaningful merchant word from a transaction description.

    Steps:
    1. Lowercase + remove accents
    2. Replace punctuation with spaces
    3. For each token, keep only its letters (strip embedded digits/symbols)
    4. Skip tokens shorter than _MIN_LETTERS or in _SKIP_TOKENS
    5. Return the first remaining token as the merchant signature
    """
    s = description.strip().lower()
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'[^\w\s]', ' ', s)          # punctuation → space

    for raw in s.split():
        letters = re.sub(r'[^a-z]', '', raw)  # keep only letters
        if len(letters) >= _MIN_LETTERS and letters not in _SKIP_TOKENS:
            return letters

    return ''


def descriptions_match(desc1: str, desc2: str) -> bool:
    """Return True if both descriptions share the same merchant signature
    (i.e. their first meaningful word is identical)."""
    key1 = _desc_key(desc1)
    key2 = _desc_key(desc2)
    if not key1 or not key2:
        return False
    return key1 == key2


async def apply_rules_to_imported(user_id, new_transactions: list) -> int:
    """After an import, apply learned categorization rules to newly inserted transactions.

    Builds a map of desc_key -> categories from all existing categorized transactions,
    then assigns matching categories to each new transaction that has none or partial categories.

    Returns the number of transactions that were auto-categorized.
    """
    from app.models.transaction import Transaction  # avoid circular import

    # Load existing transactions that already have categories (the "rules")
    existing = await Transaction.find(Transaction.user_id == user_id).to_list()
    new_ids = {t.id for t in new_transactions}

    # Build rules map: desc_key -> set of categories
    rules: dict[str, set[str]] = {}
    for t in existing:
        if t.id in new_ids or not t.categories:
            continue
        key = _desc_key(t.description)
        if not key:
            continue
        if key not in rules:
            rules[key] = set()
        rules[key].update(t.categories)

    if not rules:
        return 0

    count = 0
    for t in new_transactions:
        key = _desc_key(t.description)
        if not key or key not in rules:
            continue
        cats_to_add = [c for c in rules[key] if c not in t.categories]
        if cats_to_add:
            t.categories = list(t.categories) + cats_to_add
            await t.replace()
            count += 1

    return count
