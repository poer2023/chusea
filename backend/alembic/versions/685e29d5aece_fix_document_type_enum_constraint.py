"""fix_document_type_enum_constraint

Revision ID: 685e29d5aece
Revises: fix_enum_inconsistency
Create Date: 2025-07-13 18:14:04.442225

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '685e29d5aece'
down_revision: Union[str, None] = 'fix_enum_inconsistency'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """修复SQLite中的枚举约束，更新为小写值"""
    # 对于SQLite，我们需要重新创建表来修复枚举约束
    # 先创建新表
    op.execute("""
        CREATE TABLE documents_new (
            id VARCHAR PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            content TEXT,
            document_type VARCHAR CHECK (document_type IN ('academic', 'blog', 'social')) DEFAULT 'academic',
            word_count INTEGER DEFAULT 0,
            user_id VARCHAR NOT NULL,
            is_deleted BOOLEAN DEFAULT 0,
            created_at DATETIME,
            updated_at DATETIME,
            FOREIGN KEY(user_id) REFERENCES users (id)
        )
    """)
    
    # 复制数据
    op.execute("""
        INSERT INTO documents_new (id, title, content, document_type, word_count, user_id, is_deleted, created_at, updated_at)
        SELECT id, title, content, document_type, word_count, user_id, is_deleted, created_at, updated_at
        FROM documents
    """)
    
    # 删除旧表
    op.execute("DROP TABLE documents")
    
    # 重命名新表
    op.execute("ALTER TABLE documents_new RENAME TO documents")


def downgrade() -> None:
    """回滚操作"""
    # 重新创建带大写枚举的表
    op.execute("""
        CREATE TABLE documents_new (
            id VARCHAR PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            content TEXT,
            document_type VARCHAR CHECK (document_type IN ('ACADEMIC', 'BLOG', 'SOCIAL')) DEFAULT 'ACADEMIC',
            word_count INTEGER DEFAULT 0,
            user_id VARCHAR NOT NULL,
            is_deleted BOOLEAN DEFAULT 0,
            created_at DATETIME,
            updated_at DATETIME,
            FOREIGN KEY(user_id) REFERENCES users (id)
        )
    """)
    
    # 复制数据并转换为大写
    op.execute("""
        INSERT INTO documents_new (id, title, content, document_type, word_count, user_id, is_deleted, created_at, updated_at)
        SELECT id, title, content, UPPER(document_type), word_count, user_id, is_deleted, created_at, updated_at
        FROM documents
    """)
    
    # 删除旧表
    op.execute("DROP TABLE documents")
    
    # 重命名新表
    op.execute("ALTER TABLE documents_new RENAME TO documents")
