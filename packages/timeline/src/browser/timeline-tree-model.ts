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

import { injectable } from 'inversify';
import {
    CompositeTreeNode,
    SelectableTreeNode,
    TreeModelImpl,
} from '@theia/core/lib/browser/tree';
import { Timeline } from './timeline-service';

export interface TimelineRootNode extends CompositeTreeNode {
}

export interface TimelineNode extends SelectableTreeNode {
}

@injectable()
export class TimelineTreeModel extends TreeModelImpl {

    set timeline(timeline: Timeline | undefined) {
        if (timeline?.items) {
            const items = timeline.items;
            const root = {
                id: 'timeline-tree-root',
                parent: undefined,
                visible: false,
                rootUri: '',
                children: []
            } as TimelineRootNode;
            root.children = items.map(item => ({
                id: item.id ? item.id : item.timestamp.toString(),
                parent: root,
                name: item.label,
                visible: true
            }));
            this.root = root;
        }
    }
}
