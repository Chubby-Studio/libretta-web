// Renders tools/og.html into assets/og.png at 1200x630 with WebKit.
// Run from the repository root: swift tools/snapshot.swift
import AppKit
import WebKit

final class Renderer: NSObject, WKNavigationDelegate {
    let view = WKWebView(frame: NSRect(x: 0, y: 0, width: 1200, height: 630))
    let output: URL
    init(page: URL, output: URL) {
        self.output = output
        super.init()
        view.navigationDelegate = self
        view.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent().deletingLastPathComponent())
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            let config = WKSnapshotConfiguration()
            config.rect = NSRect(x: 0, y: 0, width: 1200, height: 630)
            config.snapshotWidth = 1200
            webView.takeSnapshot(with: config) { image, error in
                guard let image, let tiff = image.tiffRepresentation, let bitmap = NSBitmapImageRep(data: tiff),
                      let png = bitmap.representation(using: .png, properties: [:]) else {
                    print("snapshot failed: \(String(describing: error))"); exit(1)
                }
                try! png.write(to: self.output)
                print("wrote \(self.output.path) \(bitmap.pixelsWide)x\(bitmap.pixelsHigh)")
                exit(0)
            }
        }
    }
}

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let app = NSApplication.shared
let renderer = Renderer(page: root.appendingPathComponent("tools/og.html"), output: root.appendingPathComponent("assets/og.png"))
DispatchQueue.main.asyncAfter(deadline: .now() + 20) { print("timed out"); exit(1) }
app.run()
