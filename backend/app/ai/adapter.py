import litellm
from beanie import PydanticObjectId

from app.core.encryption import decrypt
from app.models.ai_config import AiConfig


async def get_ai_response(user_id: PydanticObjectId, prompt: str) -> str:
    config = await AiConfig.find_one(AiConfig.user_id == user_id)
    if not config:
        raise ValueError('No AI provider configured for this user')

    api_key = decrypt(config.api_key_encrypted)
    model = f'{config.provider}/{config.model}' if '/' not in config.model else config.model

    response = await litellm.acompletion(
        model=model,
        messages=[{'role': 'user', 'content': prompt}],
        api_key=api_key,
        **config.params,
    )

    return response.choices[0].message.content
