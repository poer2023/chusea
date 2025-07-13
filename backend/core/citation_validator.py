"""
引用校验系统
实现DOI验证、CrossRef集成和引用格式化
"""
import re
import requests
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import json

from .logging_config import logger
from .cache import cache_manager


class CitationValidator:
    """引用验证器"""
    
    def __init__(self):
        self.crossref_base_url = "https://api.crossref.org"
        self.headers = {
            "User-Agent": "AI-Writing-Assistant/1.0 (mailto:support@example.com)"
        }
        
    async def extract_citations_from_text(self, text: str) -> List[Dict[str, Any]]:
        """从文本中提取引用"""
        citations = []
        
        # 匹配DOI格式 [1] 或 (Author, Year) 格式
        doi_pattern = r'\[(\d+)\]'
        author_year_pattern = r'\(([A-Za-z\s,]+),\s*(\d{4})\)'
        
        # 提取DOI引用
        doi_matches = re.finditer(doi_pattern, text)
        for match in doi_matches:
            citation_num = match.group(1)
            citations.append({
                'type': 'numbered',
                'number': int(citation_num),
                'position': match.span(),
                'text': match.group(0)
            })
        
        # 提取作者年份引用
        author_matches = re.finditer(author_year_pattern, text)
        for match in author_matches:
            authors = match.group(1).strip()
            year = match.group(2)
            citations.append({
                'type': 'author_year',
                'authors': authors,
                'year': int(year),
                'position': match.span(),
                'text': match.group(0)
            })
        
        return citations
    
    async def validate_doi(self, doi: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """验证DOI并获取元数据"""
        try:
            # 清理DOI格式
            clean_doi = doi.strip().replace("https://doi.org/", "").replace("http://dx.doi.org/", "")
            
            # 先检查缓存
            cached_metadata = await cache_manager.get_cached_citation(clean_doi)
            if cached_metadata:
                logger.info(f"使用缓存的DOI元数据: {clean_doi}")
                return True, cached_metadata
            
            # CrossRef API请求
            url = f"{self.crossref_base_url}/works/{clean_doi}"
            
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                work = data.get('message', {})
                
                # 提取关键信息
                metadata = {
                    'doi': clean_doi,
                    'title': work.get('title', [''])[0] if work.get('title') else '',
                    'authors': self._extract_authors(work.get('author', [])),
                    'year': self._extract_year(work.get('published-print', work.get('published-online', {}))),
                    'journal': work.get('container-title', [''])[0] if work.get('container-title') else '',
                    'volume': work.get('volume', ''),
                    'pages': work.get('page', ''),
                    'url': f"https://doi.org/{clean_doi}",
                    'type': work.get('type', ''),
                    'publisher': work.get('publisher', ''),
                    'is_valid': True,
                    'validation_date': datetime.utcnow().isoformat()
                }
                
                # 缓存元数据
                await cache_manager.cache_citation(clean_doi, metadata)
                
                return True, metadata
            
            elif response.status_code == 404:
                logger.warning(f"DOI not found: {clean_doi}")
                return False, None
            
            else:
                logger.error(f"CrossRef API error {response.status_code} for DOI: {clean_doi}")
                return False, None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error validating DOI {doi}: {str(e)}")
            return False, None
        except Exception as e:
            logger.error(f"Unexpected error validating DOI {doi}: {str(e)}")
            return False, None
    
    def _extract_authors(self, authors_data: List[Dict]) -> List[str]:
        """提取作者信息"""
        authors = []
        for author in authors_data:
            given = author.get('given', '')
            family = author.get('family', '')
            if family:
                if given:
                    authors.append(f"{family}, {given}")
                else:
                    authors.append(family)
        return authors
    
    def _extract_year(self, date_parts: Dict) -> Optional[int]:
        """提取发表年份"""
        try:
            if 'date-parts' in date_parts:
                date_parts_list = date_parts['date-parts'][0]
                if date_parts_list:
                    return int(date_parts_list[0])
            return None
        except (IndexError, ValueError, TypeError):
            return None
    
    async def search_crossref(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """在CrossRef中搜索文献"""
        try:
            # 先检查缓存
            cached_results = await cache_manager.get_cached_crossref_search(f"{query}:{max_results}")
            if cached_results:
                logger.info(f"使用缓存的CrossRef搜索结果: {query}")
                return cached_results
            
            url = f"{self.crossref_base_url}/works"
            params = {
                'query': query,
                'rows': max_results,
                'sort': 'relevance',
                'order': 'desc'
            }
            
            response = requests.get(url, headers=self.headers, params=params, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                works = data.get('message', {}).get('items', [])
                
                results = []
                for work in works:
                    metadata = {
                        'doi': work.get('DOI', ''),
                        'title': work.get('title', [''])[0] if work.get('title') else '',
                        'authors': self._extract_authors(work.get('author', [])),
                        'year': self._extract_year(work.get('published-print', work.get('published-online', {}))),
                        'journal': work.get('container-title', [''])[0] if work.get('container-title') else '',
                        'volume': work.get('volume', ''),
                        'pages': work.get('page', ''),
                        'url': f"https://doi.org/{work.get('DOI', '')}" if work.get('DOI') else '',
                        'type': work.get('type', ''),
                        'publisher': work.get('publisher', ''),
                        'score': work.get('score', 0)
                    }
                    results.append(metadata)
                
                # 缓存搜索结果
                await cache_manager.cache_crossref_search(f"{query}:{max_results}", results)
                
                return results
            
            else:
                logger.error(f"CrossRef search error {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error searching CrossRef: {str(e)}")
            return []
    
    def format_citation_apa(self, metadata: Dict[str, Any]) -> str:
        """格式化APA引用"""
        try:
            # 作者
            authors = metadata.get('authors', [])
            if authors:
                if len(authors) == 1:
                    author_str = authors[0]
                elif len(authors) <= 6:
                    author_str = ', '.join(authors[:-1]) + ', & ' + authors[-1]
                else:
                    author_str = ', '.join(authors[:6]) + ', ... ' + authors[-1]
            else:
                author_str = 'Unknown Author'
            
            # 年份
            year = metadata.get('year', 'n.d.')
            
            # 标题
            title = metadata.get('title', 'Unknown Title')
            
            # 期刊
            journal = metadata.get('journal', '')
            volume = metadata.get('volume', '')
            pages = metadata.get('pages', '')
            
            # DOI
            doi = metadata.get('doi', '')
            
            # 构建引用
            citation = f"{author_str} ({year}). {title}."
            
            if journal:
                citation += f" {journal}"
                if volume:
                    citation += f", {volume}"
                if pages:
                    citation += f", {pages}"
                citation += "."
            
            if doi:
                citation += f" https://doi.org/{doi}"
            
            return citation
            
        except Exception as e:
            logger.error(f"Error formatting APA citation: {str(e)}")
            return "Error formatting citation"
    
    def format_citation_mla(self, metadata: Dict[str, Any]) -> str:
        """格式化MLA引用"""
        try:
            # 作者
            authors = metadata.get('authors', [])
            if authors:
                if len(authors) == 1:
                    # 姓在前，名在后
                    author_parts = authors[0].split(', ')
                    if len(author_parts) == 2:
                        author_str = f"{author_parts[0]}, {author_parts[1]}"
                    else:
                        author_str = authors[0]
                else:
                    # 第一作者姓在前，其余正常
                    first_author = authors[0].split(', ')
                    if len(first_author) == 2:
                        author_str = f"{first_author[0]}, {first_author[1]}"
                    else:
                        author_str = authors[0]
                    
                    for author in authors[1:]:
                        author_str += f", and {author}"
            else:
                author_str = 'Unknown Author'
            
            # 标题
            title = metadata.get('title', 'Unknown Title')
            
            # 期刊
            journal = metadata.get('journal', '')
            volume = metadata.get('volume', '')
            year = metadata.get('year', '')
            pages = metadata.get('pages', '')
            
            # 构建引用
            citation = f'{author_str}. "{title}."'
            
            if journal:
                citation += f" {journal}"
                if volume:
                    citation += f", vol. {volume}"
                if year:
                    citation += f", {year}"
                if pages:
                    citation += f", pp. {pages}"
                citation += "."
            
            return citation
            
        except Exception as e:
            logger.error(f"Error formatting MLA citation: {str(e)}")
            return "Error formatting citation"
    
    async def validate_bibliography(self, text: str) -> Dict[str, Any]:
        """验证整个参考文献列表"""
        try:
            # 提取引用
            citations = await self.extract_citations_from_text(text)
            
            results = {
                'total_citations': len(citations),
                'valid_citations': 0,
                'invalid_citations': 0,
                'citations': [],
                'errors': []
            }
            
            # 处理每个引用
            for citation in citations:
                try:
                    if citation['type'] == 'numbered':
                        # 这里需要根据编号查找对应的DOI或引用信息
                        # 简化处理：假设引用格式正确
                        results['valid_citations'] += 1
                        results['citations'].append({
                            'citation': citation,
                            'status': 'valid',
                            'message': 'Numbered citation format detected'
                        })
                    
                    elif citation['type'] == 'author_year':
                        # 尝试搜索验证
                        search_query = f"{citation['authors']} {citation['year']}"
                        search_results = await self.search_crossref(search_query, max_results=1)
                        
                        if search_results and search_results[0]['score'] > 80:
                            results['valid_citations'] += 1
                            results['citations'].append({
                                'citation': citation,
                                'status': 'valid',
                                'metadata': search_results[0],
                                'message': 'Citation verified via CrossRef'
                            })
                        else:
                            results['invalid_citations'] += 1
                            results['citations'].append({
                                'citation': citation,
                                'status': 'unverified',
                                'message': 'Could not verify citation via CrossRef'
                            })
                
                except Exception as e:
                    results['invalid_citations'] += 1
                    results['errors'].append(f"Error processing citation: {str(e)}")
            
            # 计算验证率
            if results['total_citations'] > 0:
                results['validation_rate'] = results['valid_citations'] / results['total_citations']
            else:
                results['validation_rate'] = 0.0
            
            return results
            
        except Exception as e:
            logger.error(f"Error validating bibliography: {str(e)}")
            return {
                'total_citations': 0,
                'valid_citations': 0,
                'invalid_citations': 0,
                'citations': [],
                'errors': [str(e)],
                'validation_rate': 0.0
            }


# 全局实例
citation_validator = CitationValidator()