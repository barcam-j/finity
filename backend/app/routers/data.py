import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.core.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.category_rule import CategoryRule
from app.models.analysis_cache import AnalysisCache
from app.models.import_log import ImportLog

router = APIRouter(prefix='/data', tags=['data'])


@router.get('/export/csv')
async def export_csv(current_user: User = Depends(get_current_user)):
    transactions = (
        await Transaction.find(Transaction.user_id == current_user.id)
        .sort('date')
        .to_list()
    )

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(['date', 'description', 'amount', 'categories', 'source'])
    for t in transactions:
        writer.writerow([
            str(t.date),
            t.description,
            t.amount,
            ','.join(t.categories),
            t.source,
        ])

    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename="transactions.csv"'},
    )


@router.get('/import-logs')
async def get_import_logs(current_user: User = Depends(get_current_user)):
    logs = (
        await ImportLog.find(ImportLog.user_id == current_user.id)
        .sort('-created_at')
        .to_list()
    )
    return [
        {
            'id': str(log.id),
            'source': log.source,
            'count': log.count,
            'name': log.name,
            'created_at': log.created_at.isoformat(),
        }
        for log in logs
    ]


@router.delete('/', status_code=204)
async def delete_all_data(current_user: User = Depends(get_current_user)):
    await Transaction.find(Transaction.user_id == current_user.id).delete()
    await CategoryRule.find(CategoryRule.user_id == current_user.id).delete()
    await AnalysisCache.find(AnalysisCache.user_id == current_user.id).delete()
    await ImportLog.find(ImportLog.user_id == current_user.id).delete()
