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
import { TreeWidget, TreeProps, NodeProps, TREE_NODE_SEGMENT_GROW_CLASS } from '@theia/core/lib/browser/tree';
import { TimelineNode, TimelineTreeModel } from './timeline-tree-model';
import { ContextMenuRenderer } from '@theia/core/lib/browser';
import * as React from 'react';
import { Command, CommandRegistry } from '@theia/core/lib/common';

@injectable()
export class TimelineTreeWidget extends TreeWidget {

    static ID = 'timeline-resource-widget';

    constructor(
        @inject(TreeProps) readonly props: TreeProps,
        @inject(TimelineTreeModel) readonly model: TimelineTreeModel,
        @inject(ContextMenuRenderer) protected readonly contextMenuRenderer: ContextMenuRenderer,
        @inject(CommandRegistry) protected readonly commandRegistry: CommandRegistry
    ) {
        super(props, model, contextMenuRenderer);
        this.id = TimelineTreeWidget.ID;
        this.addClass('groups-outer-container');
    }

    protected onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
    }

    protected renderNode(node: TimelineNode, props: NodeProps): React.ReactNode {
        const attributes = this.createNodeAttributes(node, props);
        const content = <TimelineItem
            name={node.name}
            label={node.id}
            command={node.command}
            commandArgs={node.commandArgs}
            commandRegistry={this.commandRegistry}/>;
        return React.createElement('div', attributes, content);
    }
}

export namespace TimelineItem {
    export interface Props {
        name: string | undefined
        label: string | undefined
        command: Command | undefined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        commandArgs: any[];
        commandRegistry: CommandRegistry
    }
}

export class TimelineItem<P extends TimelineItem.Props> extends React.Component<P> {
    constructor(props: P) {
        super(props);
    }
    render(): JSX.Element | undefined {
        const { name, label } = this.props;
        return <div className='timelineItem'
                    onClick={this.open}>
            <div className={`noWrapInfo ${TREE_NODE_SEGMENT_GROW_CLASS}`} >
                <span className='name'>{name}</span>
                <span className='label'>{label}</span>
            </div>
        </div>;
    }

    protected open = () => {
        const command: Command | undefined = this.props.command;
        if (command) {
            this.props.commandRegistry.executeCommand(command.id, ...this.props.commandArgs);
        }
    };
}
