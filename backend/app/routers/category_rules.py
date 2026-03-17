from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.models.user import User
from app.models.category_rule import CategoryRule

router = APIRouter(prefix='/category-rules', tags=['category-rules'])


@router.get('/')
async def list_rules(current_user: User = Depends(get_current_user)):
    rules = await CategoryRule.find(CategoryRule.user_id == current_user.id).to_list()
    # Group by category
    grouped: dict[str, list[dict]] = {}
    for r in rules:
        grouped.setdefault(r.category, []).append({'id': str(r.id), 'pattern': r.pattern})
    return [{'category': cat, 'rules': patterns} for cat, patterns in sorted(grouped.items())]


@router.delete('/{rule_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_rule(rule_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    rule = await CategoryRule.get(rule_id)
    if not rule or rule.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Rule not found')
    await rule.delete()
