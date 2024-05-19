const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let timerInterval;
let startTime;
let elapsed = 0;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('timer.showTimer', function () {
		const panel = vscode.window.createWebviewPanel(
			'timer',
			'Timer',
			vscode.ViewColumn.One,
			{
				enableScripts: true
			}
		);

		panel.webview.html = getWebviewContent();

		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'start':
						startTimer(panel);
						return;
					case 'stop':
						stopTimer(panel);
						return;
					case 'reset':
						resetTimer(panel);
						return;
				}
			},
			undefined,
			context.subscriptions
		);
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent() {

	const filePath = path.join(__dirname, 'index.html');


	try {
		const content = fs.readFileSync(filePath, 'utf-8');
		return content;
	} catch (err) {
		console.error('Error reading index.html:', err);
		return '';
	}
}

function startTimer(panel) {
	if (!timerInterval) {
		startTime = Date.now() - elapsed;
		timerInterval = setInterval(() => {
			elapsed = Date.now() - startTime;
			panel.webview.postMessage({ command: 'update', time: (elapsed / 1000).toFixed(1) });
		}, 100);
		panel.webview.postMessage({ command: 'status', status: 'Timer started' });
	}
}

function stopTimer(panel) {
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
		panel.webview.postMessage({ command: 'status', status: `Timer stopped at ${(elapsed / 1000).toFixed(1)}s` });
	}
}

function resetTimer(panel) {
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
	elapsed = 0;
	panel.webview.postMessage({ command: 'update', time: '0.0' });
	panel.webview.postMessage({ command: 'status', status: 'Timer reset to 0s' });
}

function deactivate() {
	if (timerInterval) {
		clearInterval(timerInterval);
	}
}

module.exports = {
	activate,
	deactivate
}
