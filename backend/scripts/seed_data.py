"""
种子数据脚本 - 用于初始化示例数据
"""
import asyncio
import sys
import os
from datetime import datetime, timezone

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from core.database import User, Document, Literature, Settings
from core.auth import get_password_hash

DATABASE_URL = "sqlite+aiosqlite:///./writing_assistant.db"

async def create_seed_data():
    """创建种子数据"""
    # 创建异步引擎和会话
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        print("🌱 开始创建种子数据...")
        
        # 创建示例用户
        demo_user = User(
            username="demo_user",
            email="demo@example.com",
            hashed_password=get_password_hash("demo123456"),
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(demo_user)
        await session.flush()  # 获取用户ID
        
        admin_user = User(
            username="admin",
            email="admin@example.com", 
            hashed_password=get_password_hash("admin123456"),
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(admin_user)
        await session.flush()
        
        print(f"✅ 创建了 {2} 个示例用户")
        
        # 创建示例文档
        sample_documents = [
            {
                "title": "人工智能技术发展趋势研究",
                "content": """# 人工智能技术发展趋势研究

## 摘要
本文深入分析了当前人工智能技术的发展现状和未来趋势，重点关注机器学习、深度学习、自然语言处理等关键领域的技术进展。

## 引言
人工智能作为当今最具变革性的技术之一，正在深刻改变着各个行业和领域...

## 技术现状
### 机器学习
当前机器学习技术已经在图像识别、语音识别、推荐系统等领域取得了显著成果...

### 深度学习
深度学习技术的快速发展为复杂问题的解决提供了新的思路...

## 未来趋势
1. 大模型技术将继续发展
2. 多模态AI成为新的热点
3. AI安全性和可解释性受到重视

## 结论
人工智能技术将继续快速发展，为人类社会带来更多价值。""",
                "document_type": "academic",
                "user_id": demo_user.id
            },
            {
                "title": "如何高效学习编程：一个前端开发者的经验分享",
                "content": """# 如何高效学习编程：一个前端开发者的经验分享

大家好！今天想和大家分享一下我在学习前端开发过程中总结的一些经验和心得。

## 为什么选择前端开发？

作为一个文科生转行程序员，我选择前端开发主要有以下几个原因：
- 入门相对容易，可以快速看到效果
- 创意与技术的完美结合
- 就业前景广阔

## 学习路径建议

### 1. 基础阶段
- HTML5 语义化标签
- CSS3 布局和动画
- JavaScript ES6+ 语法

### 2. 进阶阶段
- React/Vue.js 框架学习
- 状态管理工具使用
- 构建工具配置

### 3. 高级阶段
- 性能优化技术
- 微前端架构
- 全栈开发能力

## 实用学习技巧

✨ **多动手实践**：理论知识需要通过项目实践来巩固

🎯 **设定小目标**：将大目标分解为可执行的小任务

💡 **保持好奇心**：技术更新很快，要持续学习新技术

## 推荐资源

1. **在线教程**：MDN、菜鸟教程
2. **视频课程**：慕课网、B站
3. **实战项目**：GitHub开源项目

你们在学习过程中有什么心得呢？欢迎在评论区分享！

#前端开发 #学习心得 #编程""",
                "document_type": "blog",
                "user_id": demo_user.id
            },
            {
                "title": "今日AI写作助手使用感受",
                "content": """刚刚体验了新的AI写作助手，感觉真的很棒！🤖✨

主要功能：
📝 支持多种写作模式（学术、博客、社交）
📚 文献搜索和管理超级方便
📊 数据可视化工具很实用
🔧 格式转换功能很贴心

最喜欢的是文献管理功能，再也不用手动整理参考文献了！

对于经常需要写论文和博客的朋友来说，这真的是效率神器 💪

#AI写作 #效率工具 #科研利器""",
                "document_type": "social",
                "user_id": demo_user.id
            }
        ]
        
        for doc_data in sample_documents:
            doc = Document(
                title=doc_data["title"],
                content=doc_data["content"],
                document_type=doc_data["document_type"],
                user_id=doc_data["user_id"],
                word_count=len(doc_data["content"]),
                is_deleted=False,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            session.add(doc)
        
        print(f"✅ 创建了 {len(sample_documents)} 个示例文档")
        
        # 创建示例文献
        sample_literature = [
            {
                "title": "Attention Is All You Need",
                "authors": "Ashish Vaswani, Noam Shazeer, Niki Parmar",
                "year": 2017,
                "doi": "10.48550/arXiv.1706.03762",
                "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
                "source": "arxiv",
                "url": "https://arxiv.org/abs/1706.03762",
                "user_id": demo_user.id,
                "is_favorite": True
            },
            {
                "title": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
                "authors": "Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova",
                "year": 2018,
                "doi": "10.48550/arXiv.1810.04805",
                "abstract": "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
                "source": "arxiv",
                "url": "https://arxiv.org/abs/1810.04805",
                "user_id": demo_user.id,
                "is_favorite": False
            },
            {
                "title": "GPT-4 Technical Report",
                "authors": "OpenAI",
                "year": 2023,
                "doi": "10.48550/arXiv.2303.08774",
                "abstract": "We report the development of GPT-4, a large-scale, multimodal model which exhibits human-level performance on various professional and academic benchmarks. GPT-4 is a Transformer-based model pre-trained to predict the next token in a document.",
                "source": "arxiv",
                "url": "https://arxiv.org/abs/2303.08774",
                "user_id": demo_user.id,
                "is_favorite": True
            }
        ]
        
        for lit_data in sample_literature:
            lit = Literature(
                title=lit_data["title"],
                authors=lit_data["authors"],
                year=lit_data["year"],
                doi=lit_data["doi"],
                abstract=lit_data["abstract"],
                source=lit_data["source"],
                url=lit_data["url"],
                user_id=lit_data["user_id"],
                is_favorite=lit_data["is_favorite"],
                created_at=datetime.now(timezone.utc)
            )
            session.add(lit)
        
        print(f"✅ 创建了 {len(sample_literature)} 条示例文献")
        
        # 创建用户设置
        demo_settings = Settings(
            user_id=demo_user.id,
            theme="light",
            language="zh-CN",
            auto_save=True,
            auto_save_interval=30
        )
        session.add(demo_settings)
        
        admin_settings = Settings(
            user_id=admin_user.id,
            theme="dark",
            language="zh-CN",
            auto_save=True,
            auto_save_interval=60
        )
        session.add(admin_settings)
        
        print(f"✅ 创建了用户设置")
        
        # 提交所有更改
        await session.commit()
        print("🎉 种子数据创建完成！")
        
        # 打印账户信息
        print("\n📋 可用测试账户：")
        print("1. 演示用户:")
        print("   用户名: demo_user")
        print("   密码: demo123456")
        print("   邮箱: demo@example.com")
        print("\n2. 管理员:")
        print("   用户名: admin")
        print("   密码: admin123456")
        print("   邮箱: admin@example.com")

if __name__ == "__main__":
    print("🚀 AI写作助手 - 种子数据初始化")
    print("=" * 50)
    asyncio.run(create_seed_data())