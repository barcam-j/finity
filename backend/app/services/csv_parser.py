import csv
import io
from datetime import date
from beanie import PydanticObjectId

from app.models.transaction import Transaction


def parse_csv(content: bytes, user_id: PydanticObjectId) -> list[Transaction]:
    text = content.decode('utf-8-sig')
    reader = csv.DictReader(io.StringIO(text))
    transactions = []

    for row in reader:
        # Normalize common column name variations
        raw_date = row.get('date') or row.get('Date') or row.get('fecha') or ''
        raw_amount = row.get('amount') or row.get('Amount') or row.get('importe') or '0'
        raw_desc = row.get('description') or row.get('Description') or row.get('descripcion') or ''
        raw_category = row.get('category') or row.get('Category') or row.get('categoria') or None

        try:
            parsed_date = date.fromisoformat(raw_date.strip())
            parsed_amount = float(raw_amount.replace(',', '.').strip())
        except (ValueError, AttributeError):
            continue

        transactions.append(
            Transaction(
                user_id=user_id,
                date=parsed_date,
                amount=parsed_amount,
                description=raw_desc.strip(),
                category=raw_category.strip() if raw_category else None,
                source='csv',
            )
        )

    return transactions
