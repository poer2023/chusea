export default function TestPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        ChUseA 测试页面
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        如果您能看到这个页面，说明 Next.js 应用正在正常运行！
      </p>
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-blue-800">
          ✅ Next.js 应用已成功启动
          <br />
          ✅ TypeScript 编译正常
          <br />
          ✅ Tailwind CSS 样式加载成功
        </p>
      </div>
    </div>
  );
}