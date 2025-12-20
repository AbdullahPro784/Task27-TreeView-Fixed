export type WorkItem = {
    id: string;
    order: string;
    type: "Epic" | "Feature" | "Product Backlog Item" | "Task" | "Group";
    title: string;
    children?: WorkItem[];
};

export const TREE_DATA: WorkItem[] = [
    {
        id: "root-1",
        order: "1",
        type: "Epic",
        title: "Root Project Alpha",
        children: [
            {
                id: "feat-1",
                order: "1.1",
                type: "Feature",
                title: "Core Functionality",
                children: [
                    {
                        id: "pbi-1",
                        order: "1.1.1",
                        type: "Product Backlog Item",
                        title: "User Authentication Flow",
                        children: []
                    },
                    {
                        id: "pbi-2",
                        order: "1.1.2",
                        type: "Product Backlog Item",
                        title: "Dashboard Analytics",
                        children: [
                            {
                                id: "task-1",
                                order: "1.1.2.1",
                                type: "Task",
                                title: "Design database schema",
                            },
                            {
                                id: "task-2",
                                order: "1.1.2.2",
                                type: "Task",
                                title: "Implement API endpoints",
                            }
                        ]
                    }
                ]
            },
            {
                id: "feat-2",
                order: "1.2",
                type: "Feature",
                title: "Reporting Module",
                children: [
                    {
                        id: "pbi-3",
                        order: "1.2.1",
                        type: "Product Backlog Item",
                        title: "Export to PDF",
                        children: []
                    }
                ]
            }
        ]
    },
    {
        id: "root-2",
        order: "2",
        type: "Epic",
        title: "Secondary Initiatives",
        children: [
            {
                id: "feat-3",
                order: "2.1",
                type: "Feature",
                title: "Mobile Responsiveness",
                children: [
                    {
                        id: "task-3",
                        order: "2.1.1",
                        type: "Task",
                        title: "Fix layout on iPhone SE",
                    }
                ]
            }
        ]
    }
];
