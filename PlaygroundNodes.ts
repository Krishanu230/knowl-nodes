import type {Klass, LexicalNode} from 'lexical';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HashtagNode } from '@lexical/hashtag';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { MarkNode } from '@lexical/mark';
import { OverflowNode } from '@lexical/overflow';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { Class } from 'utility-types';

import { EmojiNode } from './EmojiNode';
import { EquationNode } from './EquationNode';
//import { ExcalidrawNode } from './ExcalidrawNode';
import { ImageNode } from './ImageNode';
import { KeywordNode } from './KeywordNode';
import { MentionNode } from './MentionNode';
import { PollNode } from './PollNode';
//import { StickyNode } from './StickyNode';
import { TweetNode } from './TweetNode';
import { TypeaheadNode } from './TypeaheadNode';
import { YouTubeNode } from './YouTubeNode';
import { GithubCodeNode } from './GithubCodeNode';
//import { FigmaNode } from './FigmaNode';
import { TableNode as NewTableNode } from './TableNode';
import { DiagramTextNode } from './DiagramTextNode';
import { CollapsibleContainerNode, CollapsibleContentNode, CollapsibleTitleNode } from './CollapsibleNode';

const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  NewTableNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  HashtagNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  OverflowNode,
  PollNode,
  ImageNode,
  MentionNode,
  EmojiNode,
  EquationNode,
  TypeaheadNode,
  KeywordNode,
  HorizontalRuleNode,
  TweetNode,
  YouTubeNode,
  MarkNode,
  GithubCodeNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  DiagramTextNode,
];

export default PlaygroundNodes;