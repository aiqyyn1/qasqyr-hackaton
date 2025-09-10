import {
    BaseNode,
    CenteredContainer,
    IconText as IconTextType, 
    Link,
    NodeType,
    Stack,
    Text,
    TitledContainer
} from "./types";
import StackNode from "./nodes/StackNode";
import {TextNode} from "./nodes/TextNode";
import {IconText} from "./nodes/IconText";
import {TitledContainerNode} from "./nodes/TitledContainerNode";
import CenteredContainerNode from "./nodes/CenteredContainerNode";

const isShowComponentName = false;

const isStackNode = (node: BaseNode): node is Stack => node.nodeType === NodeType.STACK;
const isTextNode = (node: BaseNode): node is Text => node.nodeType === NodeType.TEXT;
const isIconText = (node: BaseNode): node is IconTextType => node.nodeType === NodeType.ICON_TEXT;
const isTitledContainer = (node: BaseNode): node is TitledContainer => node.nodeType === NodeType.TITLED_CONTAINER;
const isCenteredContainer = (node: BaseNode): node is CenteredContainer => node.nodeType === NodeType.CENTERED_CONTAINER;

/**
 * Renders the given BaseNode tree dynamically.
 */
export const parser = (obj: BaseNode): React.ReactNode => {
    const renderChildren = (children: BaseNode[] | undefined) => {
        return children?.map((child) => parser(child));
    };

    if (isStackNode(obj)) {
        return (
            <div
                key={obj.id}
                id={obj.id}
                data-node-type="stack"
                className="relative"
            >
                <StackNode obj={obj}>{renderChildren(obj.children)}</StackNode>
            </div>
        );
    }

    if (isTextNode(obj)) {
        return (
            <div
                key={obj.id}
                id={obj.id}
                data-node-type="text"
                className="relative"
            >
                <TextNode obj={obj}/>
            </div>
        );
    }

    if (isIconText(obj)) {
        return (
            <div
                key={obj.id}
                id={obj.id}
                data-node-type="icon-text"
                className="relative"
            >
                <IconText obj={obj}/>
            </div>
        );
    }

    if (isTitledContainer(obj)) {
        return (
            <div
                key={obj.id}
                id={obj.id}
                data-node-type="titled-container"
                className="relative"
            >
                <TitledContainerNode obj={obj}/>
            </div>
        );
    }

    if (isCenteredContainer(obj)) {
        return (
            <div
                key={obj.id}
                id={obj.id}
                data-node-type="centered-container"
                className="relative"
            >
                <CenteredContainerNode obj={obj}/>
            </div>
        );
    }

    return <div key={obj.id}>Unknown Node Type</div>;
};