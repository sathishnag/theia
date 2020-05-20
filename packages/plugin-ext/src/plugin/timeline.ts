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
import { TimelineExt, TimelineMain } from '../common';
import { RPCProtocol } from '../common/rpc-protocol';
import { Disposable } from './types-impl';
import { TimelineProvider } from '@theia/plugin';
import { PLUGIN_RPC_CONTEXT } from '../common';
import { Timeline, TimelineOptions } from '@theia/timeline/lib/browser/timeline-service';
import { CancellationToken } from '@theia/core/lib/common';
import { URI } from 'vscode-uri';

export class TimelineExtImpl implements TimelineExt {
    private readonly proxy: TimelineMain;
    private providers = new Map<string, TimelineProvider>();

    constructor(readonly rpc: RPCProtocol) {
        this.proxy = rpc.getProxy(PLUGIN_RPC_CONTEXT.TIMELINE_MAIN);
    }

    async $getTimeline(id: string, uri: string, options: TimelineOptions, token: CancellationToken, internalOptions?: TimelineOptions): Promise<Timeline | undefined> {
        const provider = this.providers.get(id);
        const timeline = await provider?.provideTimeline(URI.parse(uri), options, token);
        if (timeline) {
            return {
                items: timeline.items.map(item => ({ label: item.label, timestamp: item.timestamp })),
                source: ''
            };
        }
    }

    registerTimelineProvider(scheme: string | string[], provider: TimelineProvider): Disposable {
        const existing = this.providers.get(provider.id);
        if (existing) {
            throw new Error(`Timeline Provider ${provider.id} already exists.`);
        }
        let disposable: Disposable | undefined;
        if (provider.onDidChange) {
            disposable = Disposable.from(provider.onDidChange(e => this.proxy.$fireTimelineChanged({
                uri: e?.uri ? e.uri.path.toString() : undefined,
                reset: true,
                id: provider.id
            }), this));
        }
        this.proxy.$registerTimelineProvider(provider.id, provider.label, scheme);
        this.providers.set(provider.id, provider);
        return  Disposable.create(() => {
            if (disposable) {
                disposable.dispose();
            }
            this.providers.delete(provider.id);
        });
    }
}
