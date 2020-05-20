/********************************************************************************
 * Copyright (C) 2020 Arm and others.
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

import { injectable, inject } from 'inversify';
import { Message } from '@phosphor/messaging';
import {
    TreeWidget,
    TreeProps
} from '@theia/core/lib/browser/tree';
import { TimelineTreeModel } from './timeline-tree-model';
import { ContextMenuRenderer } from '@theia/core/lib/browser';

@injectable()
export class TimelineTreeWidget extends TreeWidget {

    static ID = 'timeline-resource-widget-1';

    constructor(
        @inject(TreeProps) readonly props: TreeProps,
        @inject(TimelineTreeModel) readonly model: TimelineTreeModel,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer
    ) {
        super(props, model, contextMenuRenderer);
        this.id = TimelineTreeWidget.ID;
        this.addClass('groups-outer-container');
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
    }

}
