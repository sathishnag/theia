/********************************************************************************
 * Copyright (C) 2019 Red Hat, Inc. and others.
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

/* eslint-disable no-null/no-null, @typescript-eslint/no-explicit-any */

import { Message } from '@phosphor/messaging';
import { inject, injectable, postConstruct } from 'inversify';
import { DisposableCollection } from '@theia/core/lib/common/disposable';
import { BaseWidget, MessageLoop, Panel, PanelLayout, StatefulWidget, Widget } from '@theia/core/lib/browser';
import { TimelineTreeWidget } from './timeline-tree-widget';
import { EditorManager } from '@theia/editor/lib/browser';
import { TimelineService } from './timeline-service';
import { CancellationToken } from '@theia/core/lib/common';

@injectable()
export class TimelineWidget extends BaseWidget implements StatefulWidget {

    protected panel: Panel;

    static ID = 'timeline-view-1';

    @inject(TimelineTreeWidget) protected readonly resourceWidget: TimelineTreeWidget;
    @inject(EditorManager) protected readonly editorManager: EditorManager;
    @inject(TimelineService) protected readonly timelineService: TimelineService;

    constructor() {
        super();
        this.id = TimelineWidget.ID;
        this.addClass('theia-timeline');
    }

    @postConstruct()
    protected init(): void {
        const layout = new PanelLayout();
        this.layout = layout;
        this.panel = new Panel({
            layout: new PanelLayout({
            })
        });
        this.panel.node.tabIndex = -1;
        layout.addWidget(this.panel);
        this.containerLayout.addWidget(this.resourceWidget);

        this.refresh();
        const currentEditor = this.editorManager.activeEditor;
        if (currentEditor) {
            const uri = currentEditor.getResourceUri();
            if (uri) {
                for (const source of this.timelineService.getSources().map(s => s.id)) {
                    const timeline = this.timelineService.getTimeline(source, uri, {}, CancellationToken.None);
                    if (timeline) {
                        timeline.result.then(result => {
                            this.resourceWidget.model.timeline = result;
                        });
                    }
                }
            }
        }
        this.editorManager.onActiveEditorChanged(async editor => {
            if (editor) {
                const uri = editor.getResourceUri();
                if (uri) {
                    for (const source of this.timelineService.getSources().map(s => s.id)) {
                        const timeline = this.timelineService.getTimeline(source, uri, {}, CancellationToken.None);
                        if (timeline) {
                            this.resourceWidget.model.timeline = await timeline.result;
                        }
                    }
                }
            }
        });
    }

    get containerLayout(): PanelLayout {
        return this.panel.layout as PanelLayout;
    }

    protected readonly toDisposeOnRefresh = new DisposableCollection();
    protected refresh(): void {
        this.toDisposeOnRefresh.dispose();
        this.toDispose.push(this.toDisposeOnRefresh);
        this.title.label = 'Timeline';
        this.title.caption = this.title.label;
        this.update();
    }

    protected updateImmediately(): void {
        this.onUpdateRequest(Widget.Msg.UpdateRequest);
    }

    protected onUpdateRequest(msg: Message): void {
        MessageLoop.sendMessage(this.resourceWidget, msg);
        super.onUpdateRequest(msg);
    }

    protected onAfterAttach(msg: Message): void {
        this.node.appendChild(this.resourceWidget.node);

        super.onAfterAttach(msg);
        this.update();
    }

    storeState(): any {
        const state: object = {
            changesTreeState: this.resourceWidget.storeState(),
        };
        return state;
    }

    restoreState(oldState: any): void {
        const { changesTreeState } = oldState;
        this.resourceWidget.restoreState(changesTreeState);
    }

}
