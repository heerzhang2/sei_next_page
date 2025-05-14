'use client';

import { Drawer } from 'vaul';

export default function VaulDrawer() {
    //<Drawer.Title /><Drawer.Description />都是必须的 you can wrap it with our VisuallyHidden component.
    return (
        <Drawer.Root>
            <Drawer.Trigger>
                Open Drawer
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40" />

                <Drawer.Content className="bg-gray-100 h-fit fixed bottom-0 left-0 right-0 outline-none">

                    <Drawer.Description />
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
