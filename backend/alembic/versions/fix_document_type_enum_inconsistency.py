"""fix_document_type_enum_inconsistency

Revision ID: fix_enum_inconsistency
Revises: 05826d683e8e
Create Date: 2025-07-13 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fix_enum_inconsistency'
down_revision: Union[str, None] = '05826d683e8e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """修复document_type枚举值不一致问题，统一为小写格式"""
    # 更新大写的ACADEMIC为小写academic
    op.execute("UPDATE documents SET document_type = 'academic' WHERE document_type = 'ACADEMIC'")
    
    # 更新大写的BLOG为小写blog
    op.execute("UPDATE documents SET document_type = 'blog' WHERE document_type = 'BLOG'")
    
    # 更新大写的SOCIAL为小写social
    op.execute("UPDATE documents SET document_type = 'social' WHERE document_type = 'SOCIAL'")
    
    # 如果有其他不规范的值，统一处理
    # 检查是否有其他值，如果有，记录到日志或处理
    op.execute("""
        UPDATE documents 
        SET document_type = CASE 
            WHEN UPPER(document_type) = 'ACADEMIC' THEN 'academic'
            WHEN UPPER(document_type) = 'BLOG' THEN 'blog'
            WHEN UPPER(document_type) = 'SOCIAL' THEN 'social'
            ELSE document_type
        END
        WHERE document_type NOT IN ('academic', 'blog', 'social')
    """)


def downgrade() -> None:
    """回滚操作：将小写值改回大写（如果需要）"""
    # 注意：这个回滚可能会丢失原始的大小写状态
    # 实际使用中需要根据具体需求决定是否提供回滚
    op.execute("UPDATE documents SET document_type = 'ACADEMIC' WHERE document_type = 'academic'")
    op.execute("UPDATE documents SET document_type = 'BLOG' WHERE document_type = 'blog'")
    op.execute("UPDATE documents SET document_type = 'SOCIAL' WHERE document_type = 'social'")