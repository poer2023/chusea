#!/usr/bin/env python3
"""
测试运行器 - 运行所有测试并生成报告
"""
import os
import sys
import subprocess
import argparse
from datetime import datetime
from pathlib import Path

def run_command(cmd, cwd=None):
    """运行命令并返回结果"""
    print(f"Running: {cmd}")
    result = subprocess.run(
        cmd,
        shell=True,
        capture_output=True,
        text=True,
        cwd=cwd
    )
    
    if result.stdout:
        print("STDOUT:", result.stdout)
    if result.stderr:
        print("STDERR:", result.stderr)
    
    return result

def install_dependencies():
    """安装测试依赖"""
    print("Installing test dependencies...")
    result = run_command("pip install -r requirements.txt")
    if result.returncode != 0:
        print("Failed to install dependencies")
        sys.exit(1)

def run_unit_tests():
    """运行单元测试"""
    print("\n" + "="*50)
    print("Running Unit Tests")
    print("="*50)
    
    cmd = "python -m pytest tests/test_agents.py -v --tb=short"
    result = run_command(cmd)
    
    return result.returncode == 0

def run_integration_tests():
    """运行集成测试"""
    print("\n" + "="*50)
    print("Running Integration Tests")
    print("="*50)
    
    cmd = "python -m pytest tests/test_api_integration.py -v --tb=short"
    result = run_command(cmd)
    
    return result.returncode == 0

def run_e2e_tests():
    """运行端到端测试"""
    print("\n" + "="*50)
    print("Running End-to-End Tests")
    print("="*50)
    
    cmd = "python -m pytest tests/test_e2e_workflows.py -v --tb=short"
    result = run_command(cmd)
    
    return result.returncode == 0

def run_performance_tests():
    """运行性能测试"""
    print("\n" + "="*50)
    print("Running Performance Tests")
    print("="*50)
    
    cmd = "python -m pytest tests/test_performance.py -v --tb=short"
    result = run_command(cmd)
    
    return result.returncode == 0

def run_all_tests():
    """运行所有测试"""
    print("\n" + "="*50)
    print("Running All Tests")
    print("="*50)
    
    cmd = "python -m pytest tests/ -v --tb=short --html=test_report.html --self-contained-html"
    result = run_command(cmd)
    
    return result.returncode == 0

def run_coverage_tests():
    """运行覆盖率测试"""
    print("\n" + "="*50)
    print("Running Coverage Tests")
    print("="*50)
    
    # 安装coverage
    run_command("pip install coverage")
    
    # 运行覆盖率测试
    cmd = "coverage run -m pytest tests/"
    result = run_command(cmd)
    
    # 生成覆盖率报告
    run_command("coverage report -m")
    run_command("coverage html")
    
    return result.returncode == 0

def run_linting():
    """运行代码检查"""
    print("\n" + "="*50)
    print("Running Code Linting")
    print("="*50)
    
    # 安装linting工具
    run_command("pip install flake8 black isort")
    
    # 运行black格式化检查
    print("\nChecking code formatting with black...")
    result1 = run_command("black --check --diff .")
    
    # 运行isort导入排序检查
    print("\nChecking import sorting with isort...")
    result2 = run_command("isort --check-only --diff .")
    
    # 运行flake8代码检查
    print("\nRunning flake8 code analysis...")
    result3 = run_command("flake8 --max-line-length=88 --extend-ignore=E203,W503 .")
    
    return all([
        result1.returncode == 0,
        result2.returncode == 0,
        result3.returncode == 0
    ])

def check_server_status():
    """检查服务器状态"""
    print("\n" + "="*50)
    print("Checking Server Status")
    print("="*50)
    
    import requests
    import time
    
    try:
        # 检查服务器是否运行
        response = requests.get("http://localhost:8002/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and healthy")
            return True
        else:
            print(f"❌ Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Server is not accessible: {e}")
        print("Please start the server with: python main.py")
        return False

def generate_test_report(results):
    """生成测试报告"""
    print("\n" + "="*50)
    print("Test Report")
    print("="*50)
    
    report_content = []
    report_content.append("# AI Writing Assistant - Test Report")
    report_content.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report_content.append("")
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if r)
    failed_tests = total_tests - passed_tests
    
    report_content.append(f"## Summary")
    report_content.append(f"- Total Tests: {total_tests}")
    report_content.append(f"- Passed: {passed_tests}")
    report_content.append(f"- Failed: {failed_tests}")
    report_content.append(f"- Success Rate: {passed_tests/total_tests*100:.1f}%")
    report_content.append("")
    
    report_content.append("## Test Results")
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        report_content.append(f"- {test_name}: {status}")
    
    report_content.append("")
    report_content.append("## Recommendations")
    
    if failed_tests > 0:
        report_content.append("- Fix failing tests before deployment")
        report_content.append("- Review error logs for detailed information")
    
    if not results.get("Server Status", False):
        report_content.append("- Start the server before running integration tests")
    
    if not results.get("Code Linting", False):
        report_content.append("- Run code formatting: black .")
        report_content.append("- Fix import sorting: isort .")
        report_content.append("- Address flake8 warnings")
    
    # 写入报告文件
    report_path = Path("test_report.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_content))
    
    print("\n".join(report_content))
    print(f"\nDetailed report saved to: {report_path}")

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="Run AI Writing Assistant tests")
    parser.add_argument("--unit", action="store_true", help="Run unit tests only")
    parser.add_argument("--integration", action="store_true", help="Run integration tests only")
    parser.add_argument("--e2e", action="store_true", help="Run end-to-end tests only")
    parser.add_argument("--performance", action="store_true", help="Run performance tests only")
    parser.add_argument("--coverage", action="store_true", help="Run coverage tests")
    parser.add_argument("--lint", action="store_true", help="Run code linting")
    parser.add_argument("--all", action="store_true", help="Run all tests")
    parser.add_argument("--install-deps", action="store_true", help="Install dependencies")
    parser.add_argument("--check-server", action="store_true", help="Check server status")
    
    args = parser.parse_args()
    
    # 如果没有指定参数，显示帮助
    if not any(vars(args).values()):
        parser.print_help()
        return
    
    results = {}
    
    # 安装依赖
    if args.install_deps:
        install_dependencies()
    
    # 检查服务器状态
    if args.check_server or args.integration or args.e2e or args.all:
        results["Server Status"] = check_server_status()
    
    # 运行代码检查
    if args.lint or args.all:
        results["Code Linting"] = run_linting()
    
    # 运行单元测试
    if args.unit or args.all:
        results["Unit Tests"] = run_unit_tests()
    
    # 运行集成测试
    if args.integration or args.all:
        if results.get("Server Status", True):  # 如果服务器状态检查通过或未检查
            results["Integration Tests"] = run_integration_tests()
        else:
            print("Skipping integration tests - server not available")
            results["Integration Tests"] = False
    
    # 运行端到端测试
    if args.e2e or args.all:
        if results.get("Server Status", True):
            results["End-to-End Tests"] = run_e2e_tests()
        else:
            print("Skipping e2e tests - server not available")
            results["End-to-End Tests"] = False
    
    # 运行性能测试
    if args.performance or args.all:
        if results.get("Server Status", True):
            results["Performance Tests"] = run_performance_tests()
        else:
            print("Skipping performance tests - server not available")
            results["Performance Tests"] = False
    
    # 运行覆盖率测试
    if args.coverage:
        results["Coverage Tests"] = run_coverage_tests()
    
    # 生成测试报告
    if results:
        generate_test_report(results)
    
    # 退出码
    failed_tests = sum(1 for r in results.values() if not r)
    if failed_tests > 0:
        print(f"\n❌ {failed_tests} test suite(s) failed")
        sys.exit(1)
    else:
        print("\n✅ All tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()