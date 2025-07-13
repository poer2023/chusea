"""
可读性检测系统
实现Flesch-Kincaid、Gunning Fog等可读性指标
"""
import re
import math
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass

from .logging_config import logger


@dataclass
class ReadabilityMetrics:
    """可读性指标数据类"""
    flesch_reading_ease: float
    flesch_kincaid_grade: float
    gunning_fog_index: float
    smog_index: float
    coleman_liau_index: float
    automated_readability_index: float
    
    # 统计数据
    word_count: int
    sentence_count: int
    syllable_count: int
    complex_word_count: int
    avg_sentence_length: float
    avg_syllables_per_word: float
    
    # 整体评分
    overall_score: float
    difficulty_level: str
    suggestions: List[str]


class ReadabilityChecker:
    """可读性检测器"""
    
    def __init__(self):
        # 难度等级映射
        self.difficulty_levels = {
            (90, 100): ("非常容易", "小学5年级"),
            (80, 89): ("容易", "小学6年级"),
            (70, 79): ("较为容易", "初中7年级"),
            (60, 69): ("标准", "初中8-9年级"),
            (50, 59): ("较难", "高中10-12年级"),
            (30, 49): ("困难", "大学水平"),
            (0, 29): ("非常困难", "研究生水平")
        }
        
        # 中文常见字符模式
        self.chinese_pattern = re.compile(r'[\u4e00-\u9fff]')
        self.punctuation_pattern = re.compile(r'[。！？；：,，.!?;:]')
        
    def analyze_text(self, text: str, language: str = "zh") -> ReadabilityMetrics:
        """分析文本可读性"""
        try:
            if language == "zh":
                return self._analyze_chinese_text(text)
            else:
                return self._analyze_english_text(text)
        except Exception as e:
            logger.error(f"Error analyzing readability: {str(e)}")
            # 返回默认值
            return ReadabilityMetrics(
                flesch_reading_ease=50.0,
                flesch_kincaid_grade=8.0,
                gunning_fog_index=8.0,
                smog_index=8.0,
                coleman_liau_index=8.0,
                automated_readability_index=8.0,
                word_count=0,
                sentence_count=0,
                syllable_count=0,
                complex_word_count=0,
                avg_sentence_length=0.0,
                avg_syllables_per_word=0.0,
                overall_score=50.0,
                difficulty_level="标准",
                suggestions=["文本分析出错，请检查输入内容"]
            )
    
    def _analyze_chinese_text(self, text: str) -> ReadabilityMetrics:
        """分析中文文本可读性"""
        # 清理HTML标签
        clean_text = re.sub(r'<[^>]+>', '', text)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # 统计基本信息
        chinese_chars = len(self.chinese_pattern.findall(clean_text))
        sentences = self._split_chinese_sentences(clean_text)
        sentence_count = len([s for s in sentences if s.strip()])
        
        # 中文以字符为单位，不是单词
        word_count = chinese_chars
        
        if sentence_count == 0 or word_count == 0:
            return self._create_empty_metrics()
        
        # 平均句长（字符数）
        avg_sentence_length = word_count / sentence_count
        
        # 复杂句子检测（超过20字的句子）
        complex_sentences = len([s for s in sentences if len(self.chinese_pattern.findall(s)) > 20])
        complex_sentence_ratio = complex_sentences / sentence_count if sentence_count > 0 else 0
        
        # 中文可读性评分算法（自定义）
        # 基于句长、复杂句比例等因素
        base_score = 100
        
        # 句长惩罚：句子越长越难读
        length_penalty = min(avg_sentence_length * 2, 50)
        
        # 复杂句惩罚
        complexity_penalty = complex_sentence_ratio * 30
        
        # 最终评分
        chinese_readability_score = max(0, base_score - length_penalty - complexity_penalty)
        
        # 估算其他指标（基于中文特点调整）
        estimated_grade = self._estimate_chinese_grade_level(avg_sentence_length, complex_sentence_ratio)
        
        # 生成建议
        suggestions = self._generate_chinese_suggestions(avg_sentence_length, complex_sentence_ratio)
        
        # 确定难度等级
        difficulty_level = self._get_difficulty_level(chinese_readability_score)
        
        return ReadabilityMetrics(
            flesch_reading_ease=chinese_readability_score,
            flesch_kincaid_grade=estimated_grade,
            gunning_fog_index=estimated_grade,
            smog_index=estimated_grade,
            coleman_liau_index=estimated_grade,
            automated_readability_index=estimated_grade,
            word_count=word_count,
            sentence_count=sentence_count,
            syllable_count=word_count,  # 中文字符数作为音节数
            complex_word_count=complex_sentences,
            avg_sentence_length=avg_sentence_length,
            avg_syllables_per_word=1.0,  # 中文平均每字一个音节
            overall_score=chinese_readability_score,
            difficulty_level=difficulty_level,
            suggestions=suggestions
        )
    
    def _analyze_english_text(self, text: str) -> ReadabilityMetrics:
        """分析英文文本可读性"""
        # 清理文本
        clean_text = re.sub(r'<[^>]+>', '', text)
        clean_text = re.sub(r'[^\w\s.!?]', ' ', clean_text)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # 分句
        sentences = re.split(r'[.!?]+', clean_text)
        sentences = [s.strip() for s in sentences if s.strip()]
        sentence_count = len(sentences)
        
        # 分词
        words = re.findall(r'\b\w+\b', clean_text.lower())
        word_count = len(words)
        
        if sentence_count == 0 or word_count == 0:
            return self._create_empty_metrics()
        
        # 计算音节数
        syllable_count = sum(self._count_syllables(word) for word in words)
        
        # 复杂词汇（3个或以上音节）
        complex_words = [word for word in words if self._count_syllables(word) >= 3]
        complex_word_count = len(complex_words)
        
        # 平均值
        avg_sentence_length = word_count / sentence_count
        avg_syllables_per_word = syllable_count / word_count
        
        # Flesch Reading Ease
        flesch_ease = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        flesch_ease = max(0, min(100, flesch_ease))
        
        # Flesch-Kincaid Grade Level
        fk_grade = (0.39 * avg_sentence_length) + (11.8 * avg_syllables_per_word) - 15.59
        fk_grade = max(0, fk_grade)
        
        # Gunning Fog Index
        complex_word_ratio = complex_word_count / word_count
        gunning_fog = 0.4 * (avg_sentence_length + 100 * complex_word_ratio)
        
        # SMOG Index
        if sentence_count >= 30:
            smog = 1.043 * math.sqrt(complex_word_count * (30 / sentence_count)) + 3.1291
        else:
            smog = gunning_fog  # 使用Gunning Fog作为近似
        
        # Coleman-Liau Index
        avg_letters_per_100_words = (len(re.sub(r'\s', '', clean_text)) / word_count) * 100
        avg_sentences_per_100_words = (sentence_count / word_count) * 100
        coleman_liau = (0.0588 * avg_letters_per_100_words) - (0.296 * avg_sentences_per_100_words) - 15.8
        
        # Automated Readability Index
        avg_chars_per_word = len(re.sub(r'\s', '', clean_text)) / word_count
        ari = (4.71 * avg_chars_per_word) + (0.5 * avg_sentence_length) - 21.43
        
        # 整体评分（Flesch Reading Ease的加权平均）
        overall_score = flesch_ease
        
        # 难度等级
        difficulty_level = self._get_difficulty_level(flesch_ease)
        
        # 建议
        suggestions = self._generate_english_suggestions(avg_sentence_length, complex_word_ratio, flesch_ease)
        
        return ReadabilityMetrics(
            flesch_reading_ease=flesch_ease,
            flesch_kincaid_grade=fk_grade,
            gunning_fog_index=gunning_fog,
            smog_index=smog,
            coleman_liau_index=coleman_liau,
            automated_readability_index=ari,
            word_count=word_count,
            sentence_count=sentence_count,
            syllable_count=syllable_count,
            complex_word_count=complex_word_count,
            avg_sentence_length=avg_sentence_length,
            avg_syllables_per_word=avg_syllables_per_word,
            overall_score=overall_score,
            difficulty_level=difficulty_level,
            suggestions=suggestions
        )
    
    def _split_chinese_sentences(self, text: str) -> List[str]:
        """分割中文句子"""
        sentences = re.split(r'[。！？]', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _count_syllables(self, word: str) -> int:
        """计算英文单词音节数"""
        word = word.lower()
        if len(word) <= 3:
            return 1
        
        # 移除词尾的e
        if word.endswith('e'):
            word = word[:-1]
        
        # 计算元音群
        vowels = 'aeiouy'
        syllable_count = 0
        prev_char_was_vowel = False
        
        for char in word:
            if char in vowels:
                if not prev_char_was_vowel:
                    syllable_count += 1
                prev_char_was_vowel = True
            else:
                prev_char_was_vowel = False
        
        return max(1, syllable_count)
    
    def _estimate_chinese_grade_level(self, avg_sentence_length: float, complex_ratio: float) -> float:
        """估算中文年级水平"""
        # 基于句长和复杂度估算
        base_grade = 6.0  # 基础年级
        
        # 句长影响
        if avg_sentence_length > 25:
            base_grade += 3
        elif avg_sentence_length > 20:
            base_grade += 2
        elif avg_sentence_length > 15:
            base_grade += 1
        
        # 复杂句影响
        base_grade += complex_ratio * 4
        
        return min(16, max(1, base_grade))
    
    def _get_difficulty_level(self, score: float) -> str:
        """根据分数获取难度等级"""
        for (min_score, max_score), (level, grade) in self.difficulty_levels.items():
            if min_score <= score <= max_score:
                return f"{level}（{grade}）"
        return "未知难度"
    
    def _generate_chinese_suggestions(self, avg_length: float, complex_ratio: float) -> List[str]:
        """生成中文写作建议"""
        suggestions = []
        
        if avg_length > 25:
            suggestions.append("句子过长，建议将长句拆分为多个短句")
        elif avg_length > 20:
            suggestions.append("部分句子较长，可考虑适当简化")
        
        if complex_ratio > 0.3:
            suggestions.append("复杂句子过多，建议使用更简洁的表达")
        
        if avg_length < 8:
            suggestions.append("句子过短，可以适当增加描述性内容")
        
        if not suggestions:
            suggestions.append("文本可读性良好，继续保持")
        
        return suggestions
    
    def _generate_english_suggestions(self, avg_length: float, complex_ratio: float, flesch_score: float) -> List[str]:
        """生成英文写作建议"""
        suggestions = []
        
        if avg_length > 20:
            suggestions.append("Average sentence length is too long. Consider breaking down complex sentences.")
        
        if complex_ratio > 0.15:
            suggestions.append("Too many complex words. Try using simpler vocabulary where possible.")
        
        if flesch_score < 30:
            suggestions.append("Text is very difficult to read. Simplify sentence structure and vocabulary.")
        elif flesch_score < 50:
            suggestions.append("Text is somewhat difficult. Consider shortening sentences and using simpler words.")
        
        if flesch_score > 90:
            suggestions.append("Text might be too simple for the intended audience.")
        
        if not suggestions:
            suggestions.append("Text readability is appropriate for the target audience.")
        
        return suggestions
    
    def _create_empty_metrics(self) -> ReadabilityMetrics:
        """创建空的指标对象"""
        return ReadabilityMetrics(
            flesch_reading_ease=0.0,
            flesch_kincaid_grade=0.0,
            gunning_fog_index=0.0,
            smog_index=0.0,
            coleman_liau_index=0.0,
            automated_readability_index=0.0,
            word_count=0,
            sentence_count=0,
            syllable_count=0,
            complex_word_count=0,
            avg_sentence_length=0.0,
            avg_syllables_per_word=0.0,
            overall_score=0.0,
            difficulty_level="无内容",
            suggestions=["文本为空或过短，无法分析"]
        )
    
    def get_recommendations(self, metrics: ReadabilityMetrics, target_score: float = 70.0) -> Dict[str, Any]:
        """获取改进建议"""
        current_score = metrics.overall_score
        score_diff = target_score - current_score
        
        recommendations = {
            'current_score': current_score,
            'target_score': target_score,
            'score_difference': score_diff,
            'needs_improvement': score_diff > 5,
            'improvements': []
        }
        
        if score_diff > 5:
            # 需要提高可读性
            if metrics.avg_sentence_length > 20:
                recommendations['improvements'].append({
                    'type': 'sentence_length',
                    'message': '缩短句子长度，目标每句15-20字符',
                    'priority': 'high'
                })
            
            if metrics.complex_word_count / metrics.word_count > 0.15:
                recommendations['improvements'].append({
                    'type': 'vocabulary',
                    'message': '减少复杂词汇的使用',
                    'priority': 'medium'
                })
            
            recommendations['improvements'].append({
                'type': 'structure',
                'message': '使用更多过渡词和连接词',
                'priority': 'low'
            })
        
        elif score_diff < -5:
            # 可能过于简单
            recommendations['improvements'].append({
                'type': 'complexity',
                'message': '可以适当增加内容的深度和复杂性',
                'priority': 'low'
            })
        
        return recommendations


# 全局实例
readability_checker = ReadabilityChecker()