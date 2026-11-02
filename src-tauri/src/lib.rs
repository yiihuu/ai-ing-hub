// AI 会话中枢 —— Tauri 桌面壳
// dev 模式：Tauri 启动 Node 中枢服务（beforeDevCommand），并把窗口指向它。
// 后续若要把服务编译进安装包，可将 server.js 以 sidecar 形式打包，
// 或把 /api 服务用 Rust（axum 等）重写后在此 invoke。
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
