#!/usr/bin/env python3
"""
测试完整工作流的脚本
"""
import asyncio
import requests
import json
import time
from typing import Dict, Any

API_BASE = "http://localhost:8003"


class WorkflowTester:
    def __init__(self):
        self.token = None
        self.document_id = None
        
    def make_request(self, method: str, endpoint: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """发送HTTP请求"""
        url = f"{API_BASE}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=data)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=headers, json=data)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    print(f"   Error details: {error_data}")
                except:
                    print(f"   Response: {e.response.text}")
            return {"success": False, "error": str(e)}
    
    def test_health_check(self):
        """测试健康检查"""
        print("🔍 Testing health check...")
        result = self.make_request('GET', '/health')
        
        if result.get('status') == 'healthy':
            print("✅ Health check passed")
            return True
        else:
            print("❌ Health check failed")
            return False
    
    def test_user_registration(self):
        """测试用户注册"""
        print("🔍 Testing user registration...")
        
        user_data = {
            "username": f"test_user_{int(time.time())}",
            "email": f"test_{int(time.time())}@example.com",
            "password": "test123456"
        }
        
        result = self.make_request('POST', '/api/auth/register', user_data)
        
        if result.get('success', True):  # 某些API可能不返回success字段
            print("✅ User registration passed")
            return user_data
        else:
            print("❌ User registration failed")
            return None
    
    def test_user_login(self, user_data: Dict[str, str]):
        """测试用户登录"""
        print("🔍 Testing user login...")
        
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        
        result = self.make_request('POST', '/api/auth/login-json', login_data)
        
        if result.get('access_token'):
            self.token = result['access_token']
            print("✅ User login passed")
            return True
        else:
            print("❌ User login failed")
            return False
    
    def test_create_document(self):
        """测试创建工作流文档"""
        print("🔍 Testing document creation...")
        
        doc_data = {
            "title": "测试文档",
            "config": {
                "readabilityThreshold": 70,
                "maxRetries": 3,
                "autoRun": False,
                "timeout": 60,
                "writingMode": "academic"
            }
        }
        
        result = self.make_request('POST', '/api/workflow/documents', doc_data)
        
        if result.get('id'):
            self.document_id = result['id']
            print(f"✅ Document created: {self.document_id}")
            return True
        else:
            print("❌ Document creation failed")
            return False
    
    def test_start_workflow(self):
        """测试启动工作流"""
        print("🔍 Testing workflow start...")
        
        workflow_data = {
            "document_id": self.document_id,
            "prompt": "请写一篇关于人工智能在教育领域应用的学术论文，包含引言、主体和结论部分",
            "config": {
                "readabilityThreshold": 70,
                "maxRetries": 3,
                "autoRun": False,
                "timeout": 60
            }
        }
        
        result = self.make_request('POST', '/api/workflow/start', workflow_data)
        
        if result.get('success'):
            print("✅ Workflow started successfully")
            return True
        else:
            print("❌ Workflow start failed")
            return False
    
    def test_workflow_status(self):
        """测试工作流状态查询"""
        print("🔍 Testing workflow status...")
        
        result = self.make_request('GET', f'/api/workflow/{self.document_id}/status')
        
        if result.get('document_id'):
            print(f"✅ Workflow status: {result.get('status', 'unknown')}")
            print(f"   Progress: {result.get('progress', 0):.1f}%")
            return result
        else:
            print("❌ Workflow status check failed")
            return None
    
    def test_workflow_nodes(self):
        """测试工作流节点查询"""
        print("🔍 Testing workflow nodes...")
        
        result = self.make_request('GET', f'/api/workflow/{self.document_id}/nodes')
        
        if isinstance(result, list):
            print(f"✅ Found {len(result)} workflow nodes")
            for node in result:
                print(f"   - {node.get('type')}: {node.get('status')}")
            return result
        else:
            print("❌ Workflow nodes check failed")
            return None
    
    def wait_for_completion(self, max_wait_time: int = 300):
        """等待工作流完成"""
        print("⏳ Waiting for workflow completion...")
        
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            status = self.test_workflow_status()
            
            if status:
                current_status = status.get('status', 'unknown')
                
                if current_status in ['done', 'failed']:
                    print(f"🏁 Workflow completed with status: {current_status}")
                    return current_status == 'done'
                
                print(f"⏳ Still running... Status: {current_status}")
            
            time.sleep(5)  # 等待5秒
        
        print("⏰ Workflow completion timeout")
        return False
    
    def run_complete_test(self):
        """运行完整测试"""
        print("🚀 Starting complete workflow test...\n")
        
        # 1. 健康检查
        if not self.test_health_check():
            return False
        print()
        
        # 2. 用户注册
        user_data = self.test_user_registration()
        if not user_data:
            return False
        print()
        
        # 3. 用户登录
        if not self.test_user_login(user_data):
            return False
        print()
        
        # 4. 创建文档
        if not self.test_create_document():
            return False
        print()
        
        # 5. 启动工作流
        if not self.test_start_workflow():
            return False
        print()
        
        # 6. 监控工作流执行
        success = self.wait_for_completion()
        print()
        
        # 7. 查看最终节点状态
        self.test_workflow_nodes()
        print()
        
        if success:
            print("🎉 Complete workflow test PASSED!")
        else:
            print("💥 Complete workflow test FAILED!")
        
        return success


def main():
    """主函数"""
    tester = WorkflowTester()
    success = tester.run_complete_test()
    
    if success:
        print("\n✅ All tests passed! The AI Writing Tool is working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the logs above.")
    
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())