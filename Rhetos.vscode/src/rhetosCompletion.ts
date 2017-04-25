'use strict';

import * as vscode from 'vscode';
import { rhetosSuggestions, isPositionInString } from './util';

export class RhetosCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        return new Promise<vscode.CompletionItem[]>((resolve, reject) => {
            let lineText = document.lineAt(position.line).text;
            let lineTillCurrentPosition = lineText.substr(0, position.character);

            if (lineText.match(/^\s*\/\//)) {
                return resolve([]);
            }

            let inString = isPositionInString(document, position);
            if (!inString && lineTillCurrentPosition.endsWith('\"')) {
                return resolve([]);
            }

            // get current word
            let wordAtPosition = document.getWordRangeAtPosition(position);
            let currentWord = '';
            if (wordAtPosition && wordAtPosition.start.character < position.character) {
                let word = document.getText(wordAtPosition);
                currentWord = word.substr(0, position.character - wordAtPosition.start.character);
            }

            if (currentWord.match(/^\d+$/)) {
                return resolve([]);
            }

            let offset = document.offsetAt(position);
            let inputText = document.getText();
            let suggestions: vscode.CompletionItem[] = [];
            if (currentWord.length > 0) {
                currentWord = currentWord.toLowerCase();
                rhetosSuggestions
                    .filter(s => s.keyword.toLowerCase().startsWith(currentWord))
                    .forEach(s => {
                        let item = new vscode.CompletionItem(s.keyword);
                        item.kind = vscode.CompletionItemKind.Keyword;
                        item.detail = s.detail;
                        item.documentation = s.documentation
                        suggestions.push(item);
                    });
            }
            resolve(suggestions);
        });
    }
    resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return item;
    }
}