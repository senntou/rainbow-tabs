// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import hash from "fnv1a";

let activeEditorChangeSubscription: vscode.Disposable | null = null;

function getHashedColor(): Color | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return undefined;
  }

  // パスをハッシュ化して色を決定
  const idx = hash(editor.document.uri.path) % colors.length;
  return colors[idx];
}

function setTabsColor(color: Color | "default"): void {
  // タブの色を変更
  vscode.workspace.getConfiguration().update(
    "workbench.colorCustomizations",
    {
      "editorGroupHeader.tabsBorder": color,
      "tab.selectedBorderTop": color,
    },
    vscode.ConfigurationTarget.Global
  );
}

function changeColorByFileName() {
  const color = getHashedColor();
  if (color) {
    setTabsColor(color);
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const state = context.globalState;
  const isActive = (await state.get("rainbow-tabs.isActive")) ?? true;

  // 初期状態で有効ならば activate コマンドを実行
  if (isActive) {
    vscode.commands.executeCommand("rainbow-tabs.activate");
  }

  const activateCommand = vscode.commands.registerCommand(
    "rainbow-tabs.activate",
    async () => {
      // 状態を更新
      await state.update("rainbow-tabs.isActive", true);

      if (activeEditorChangeSubscription) {
        return;
      }

      // タブの色を変更
      changeColorByFileName();

      // タブが変更されたときに色を変更
      activeEditorChangeSubscription =
        vscode.window.onDidChangeActiveTextEditor((e) => {
          changeColorByFileName();
        });
    }
  );

  const deactivateCommand = vscode.commands.registerCommand(
    "rainbow-tabs.deactivate",
    async () => {
      // 状態を更新
      await state.update("rainbow-tabs.isActive", false);

      // イベントリスナーを削除
      if (activeEditorChangeSubscription) {
        activeEditorChangeSubscription.dispose();
        activeEditorChangeSubscription = null;
      }

      // タブの色をデフォルトに戻す
      setTabsColor("default");
    }
  );

  context.subscriptions.push(activateCommand);
  context.subscriptions.push(deactivateCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}

const colors = [
  "#FF0000", // red
  "#00FF00", // green
  "#0000FF", // blue
  "#FFFF00", // yellow
  "#00FFFF", // cyan
  "#FF00FF", // magenta
  "#C0C0C0", // silver
  "#FF7F50", // coral
  "#6495ED", // cornflower blue
  "#DC143C", // crimson
  "#008B8B", // dark cyan
  "#FF8C00", // dark orange
  "#9932CC", // dark orchid
  "#FF1493", // deep pink
  "#00BFFF", // deep sky blue
  "#FFD700", // gold
  "#FF6347", // tomato
  "#FF4500", // orange red
  "#FFFFE0", // light yellow
  "#ADD8E6", // light blue
  "#D3D3D3", // light gray
  "#90EE90", // light green
  "#FFB6C1", // light pink
  "#F0E68C", // khaki
  "#FFDEAD", // navajo white
];
type Color = (typeof colors)[number];
