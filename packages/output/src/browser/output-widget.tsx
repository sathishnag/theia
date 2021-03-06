/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { inject, injectable, postConstruct } from 'inversify';
import { Message } from '@theia/core/lib/browser';
import { OutputChannel, OutputChannelManager, OutputChannelSeverity } from '../common/output-channel';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import * as React from 'react';

import '../../src/browser/style/output.css';

export const OUTPUT_WIDGET_KIND = 'outputView';

@injectable()
export class OutputWidget extends ReactWidget {

    @inject(OutputChannelManager)
    protected readonly outputChannelManager: OutputChannelManager;

    constructor() {
        super();
        this.id = OUTPUT_WIDGET_KIND;
        this.title.label = 'Output';
        this.title.caption = 'Output';
        this.title.iconClass = 'fa output-tab-icon';
        this.title.closable = true;
        this.addClass('theia-output');
        this.node.tabIndex = 0;
    }

    @postConstruct()
    protected init(): void {
        this.outputChannelManager.getChannels().forEach(this.registerListener.bind(this));
        this.toDispose.push(this.outputChannelManager.onChannelAdded(channel => {
            this.registerListener(channel);
            this.update();
        }));
        this.toDispose.push(this.outputChannelManager.onSelectedChannelChange(event => {
            this.update();
        }));
        this.update();
    }

    protected onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        const channelSelector = document.getElementById(OutputWidget.IDs.CHANNEL_LIST);
        if (channelSelector) {
            channelSelector.focus();
        } else {
            this.node.focus();
        }
    }

    protected registerListener(outputChannel: OutputChannel): void {
        this.toDispose.push(outputChannel.onContentChange(c => {
            if (outputChannel === this.outputChannelManager.selectedChannel) {
                this.update();
            }
        }));
    }

    protected render(): React.ReactNode {
        return <React.Fragment>
            {this.renderChannelContents()}
        </React.Fragment>;
    }

    clear(): void {
        if (this.outputChannelManager.selectedChannel) {
            this.outputChannelManager.selectedChannel.clear();
        }
    }

    selectAll(): void {
        if (this.outputChannelManager.selectedChannel) {
            const element = document.getElementById(OutputWidget.IDs.CONTENTS);
            if (element) {
                const selectElementContent = (htmlElement: HTMLElement) => {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    if (selection && range) {
                        range.selectNodeContents(htmlElement);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                };
                element.focus();
                selectElementContent(element);
            }
        }
    }

    protected renderChannelContents(): React.ReactNode {
        return <div id={OutputWidget.IDs.CONTENTS}>{this.renderLines()}</div>;
    }

    protected renderLines(): React.ReactNode[] {
        let id = 0;
        const result = [];

        if (this.outputChannelManager.selectedChannel) {
            for (const outputChannelLine of this.outputChannelManager.selectedChannel.getLines()) {
                const lines = outputChannelLine.text.split(/[\n\r]+/);
                let className;
                if (outputChannelLine.severity === OutputChannelSeverity.Error) {
                    className = 'theia-output-error';
                } else if (outputChannelLine.severity === OutputChannelSeverity.Warning) {
                    className = 'theia-output-warning';
                }
                for (const line of lines) {
                    result.push(<div className={`theia-output-lines ${className}`} key={id++}>{line}</div>);
                }
            }
        }
        if (result.length === 0) {
            result.push(<div className={'theia-output-lines'} key={id++}>{'<no output yet>'}</div>);
        }
        return result;
    }

    protected onUpdateRequest(msg: Message): void {
        super.onUpdateRequest(msg);
        setTimeout(() => {
            const div = document.getElementById(OutputWidget.IDs.CONTENTS) as HTMLDivElement;
            if (div && div.children.length > 0) {
                div.children[div.children.length - 1].scrollIntoView(false);
            }
        });
    }
}

export namespace OutputWidget {
    export namespace IDs {
        export const CONTENTS = 'outputContents';
        export const CHANNEL_LIST = 'outputChannelList';
    }
}
