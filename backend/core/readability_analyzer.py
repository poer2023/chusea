"""
可读性分析器 - 实现 Flesch-Kincaid 可读性检测
"""
import re
import math
from typing import Dict, Any, Optional
from dataclasses import dataclass
import jieba
import jieba.posseg as pseg

@dataclass
class ReadabilityMetrics:
    """可读性指标数据类"""
    flesch_score: float
    flesch_grade: float
    sentences: int
    words: int
    syllables: int
    avg_sentence_length: float
    avg_syllables_per_word: float
    readability_level: str
    suggestions: list[str]

class ReadabilityAnalyzer:
    """可读性分析器"""
    
    def __init__(self):
        # 初始化jieba分词器
        jieba.initialize()
        
        # 中文常用字符集
        self.chinese_chars = set('的一是了我不人在他有这个上们来到时大地为子中你说生国年着就那和要她出也得里后自以会家可下而过天去能对小多然于心学么之都好看起发当没成只如事把还用第样道想作种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位分爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感')
        
        # 英文音节规则
        self.vowel_groups = re.compile(r'[aeiouy]+', re.I)
        self.silent_e = re.compile(r'e$', re.I)
        
    def analyze_text(self, text: str) -> ReadabilityMetrics:
        """分析文本可读性"""
        if not text or not text.strip():
            return ReadabilityMetrics(
                flesch_score=0.0,
                flesch_grade=0.0,
                sentences=0,
                words=0,
                syllables=0,
                avg_sentence_length=0.0,
                avg_syllables_per_word=0.0,
                readability_level="无法分析",
                suggestions=["文本为空，无法分析"]
            )
        
        # 检测文本语言
        is_chinese = self._is_chinese_text(text)
        
        if is_chinese:
            return self._analyze_chinese_text(text)
        else:
            return self._analyze_english_text(text)
    
    def _is_chinese_text(self, text: str) -> bool:
        """判断文本是否为中文"""
        chinese_char_count = sum(1 for char in text if char in self.chinese_chars)
        total_chars = len(text.replace(' ', '').replace('\n', ''))
        return chinese_char_count / max(total_chars, 1) > 0.3
    
    def _analyze_chinese_text(self, text: str) -> ReadabilityMetrics:
        """分析中文文本可读性"""
        # 清理文本
        cleaned_text = self._clean_text(text)
        
        # 句子分割
        sentences = self._count_sentences_chinese(cleaned_text)
        sentence_count = len(sentences)
        
        # 分词
        words = list(jieba.cut(cleaned_text))
        words = [word for word in words if len(word.strip()) > 0]
        word_count = len(words)
        
        # 计算字符数（中文以字符为单位）
        char_count = sum(len(word) for word in words)
        
        # 计算平均句长
        avg_sentence_length = word_count / max(sentence_count, 1)
        
        # 计算平均字长
        avg_chars_per_word = char_count / max(word_count, 1)
        
        # 中文可读性评分（改进的公式）
        flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_chars_per_word)
        
        # 限制分数范围
        flesch_score = max(0, min(100, flesch_score))
        
        # 计算难度等级
        flesch_grade = self._calculate_chinese_grade(flesch_score)
        
        # 获取可读性等级和建议
        readability_level = self._get_readability_level(flesch_score)
        suggestions = self._get_suggestions_chinese(flesch_score, avg_sentence_length, avg_chars_per_word)
        
        return ReadabilityMetrics(
            flesch_score=flesch_score,
            flesch_grade=flesch_grade,
            sentences=sentence_count,
            words=word_count,
            syllables=char_count,  # 中文用字符数代替音节
            avg_sentence_length=avg_sentence_length,
            avg_syllables_per_word=avg_chars_per_word,
            readability_level=readability_level,
            suggestions=suggestions
        )
    
    def _analyze_english_text(self, text: str) -> ReadabilityMetrics:
        """分析英文文本可读性"""
        # 清理文本
        cleaned_text = self._clean_text(text)
        
        # 句子分割
        sentences = self._count_sentences_english(cleaned_text)
        sentence_count = len(sentences)
        
        # 单词分割
        words = re.findall(r'\b\w+\b', cleaned_text.lower())
        word_count = len(words)
        
        # 计算音节数
        syllable_count = sum(self._count_syllables(word) for word in words)
        
        # 计算平均值
        avg_sentence_length = word_count / max(sentence_count, 1)
        avg_syllables_per_word = syllable_count / max(word_count, 1)
        
        # Flesch Reading Ease Score
        flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        flesch_score = max(0, min(100, flesch_score))
        
        # Flesch-Kincaid Grade Level
        flesch_grade = (0.39 * avg_sentence_length) + (11.8 * avg_syllables_per_word) - 15.59
        flesch_grade = max(0, flesch_grade)
        
        # 获取可读性等级和建议
        readability_level = self._get_readability_level(flesch_score)
        suggestions = self._get_suggestions_english(flesch_score, avg_sentence_length, avg_syllables_per_word)
        
        return ReadabilityMetrics(
            flesch_score=flesch_score,
            flesch_grade=flesch_grade,
            sentences=sentence_count,
            words=word_count,
            syllables=syllable_count,
            avg_sentence_length=avg_sentence_length,
            avg_syllables_per_word=avg_syllables_per_word,
            readability_level=readability_level,
            suggestions=suggestions
        )
    
    def _clean_text(self, text: str) -> str:
        """清理文本"""
        # 移除HTML标签
        text = re.sub(r'<[^>]+>', '', text)
        # 移除多余空白
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _count_sentences_chinese(self, text: str) -> list:
        """中文句子分割"""
        sentences = re.split(r'[。！？；\n]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _count_sentences_english(self, text: str) -> list:
        """英文句子分割"""
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _count_syllables(self, word: str) -> int:
        """计算英文单词音节数"""
        if not word:
            return 0
        
        # 转换为小写
        word = word.lower()
        
        # 计算元音组合数
        syllables = len(self.vowel_groups.findall(word))
        
        # 减去词尾的静音e
        if self.silent_e.search(word):
            syllables -= 1
        
        # 至少有一个音节
        return max(1, syllables)
    
    def _calculate_chinese_grade(self, flesch_score: float) -> float:
        """计算中文文本的年级水平"""
        if flesch_score >= 90:
            return 5.0  # 小学5年级
        elif flesch_score >= 80:
            return 6.0  # 小学6年级
        elif flesch_score >= 70:
            return 7.0  # 初中1年级
        elif flesch_score >= 60:
            return 8.0  # 初中2年级
        elif flesch_score >= 50:
            return 9.0  # 初中3年级
        elif flesch_score >= 40:
            return 10.0  # 高中1年级
        elif flesch_score >= 30:
            return 11.0  # 高中2年级
        else:
            return 12.0  # 高中3年级及以上
    
    def _get_readability_level(self, flesch_score: float) -> str:
        """获取可读性等级"""
        if flesch_score >= 90:
            return "非常易读"
        elif flesch_score >= 80:
            return "易读"
        elif flesch_score >= 70:
            return "中等易读"
        elif flesch_score >= 60:
            return "标准"
        elif flesch_score >= 50:
            return "较难"
        elif flesch_score >= 30:
            return "困难"
        else:
            return "非常困难"
    
    def _get_suggestions_chinese(self, flesch_score: float, avg_sentence_length: float, avg_chars_per_word: float) -> list[str]:
        """获取中文文本优化建议"""
        suggestions = []
        
        if flesch_score < 70:
            suggestions.append("文本可读性偏低，建议进行以下优化：")
            
            if avg_sentence_length > 20:
                suggestions.append("• 句子过长，建议将长句分解为多个短句")
            
            if avg_chars_per_word > 2.5:
                suggestions.append("• 用词偏复杂，建议使用更简单的词汇")
            
            suggestions.append("• 增加过渡词和连接词，提高逻辑连贯性")
            suggestions.append("• 考虑使用更多的具体例子和说明")
        
        elif flesch_score >= 70:
            suggestions.append("文本可读性良好，达到目标标准")
        
        return suggestions
    
    def _get_suggestions_english(self, flesch_score: float, avg_sentence_length: float, avg_syllables_per_word: float) -> list[str]:
        """获取英文文本优化建议"""
        suggestions = []
        
        if flesch_score < 70:
            suggestions.append("Text readability is below target, consider these improvements:")
            
            if avg_sentence_length > 20:
                suggestions.append("• Sentences are too long, break them into shorter ones")
            
            if avg_syllables_per_word > 1.5:
                suggestions.append("• Words are too complex, use simpler vocabulary")
            
            suggestions.append("• Add transition words for better flow")
            suggestions.append("• Use more concrete examples and explanations")
        
        elif flesch_score >= 70:
            suggestions.append("Text readability is good, meets target standards")
        
        return suggestions
    
    def check_readability_threshold(self, text: str, threshold: float = 70.0) -> bool:
        """检查文本是否达到可读性阈值"""
        metrics = self.analyze_text(text)
        return metrics.flesch_score >= threshold
    
    def get_readability_report(self, text: str) -> Dict[str, Any]:
        """获取完整的可读性报告"""
        metrics = self.analyze_text(text)
        
        return {
            "flesch_score": metrics.flesch_score,
            "flesch_grade": metrics.flesch_grade,
            "readability_level": metrics.readability_level,
            "statistics": {
                "sentences": metrics.sentences,
                "words": metrics.words,
                "syllables": metrics.syllables,
                "avg_sentence_length": metrics.avg_sentence_length,
                "avg_syllables_per_word": metrics.avg_syllables_per_word
            },
            "suggestions": metrics.suggestions,
            "meets_threshold": metrics.flesch_score >= 70.0
        }

# 全局实例
readability_analyzer = ReadabilityAnalyzer()