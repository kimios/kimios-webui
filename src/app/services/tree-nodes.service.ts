import {Injectable} from '@angular/core';
import {TreeNode} from 'angular-tree-component';
import {BROWSE_TREE_MODE} from '../main/model/browse-tree-mode.enum';

@Injectable({
  providedIn: 'root'
})
export class TreeNodesService {

  private _treeNodes: Map<BROWSE_TREE_MODE, Array<TreeNode>>;

  constructor() {
    this._treeNodes = new Map<BROWSE_TREE_MODE, Array<TreeNode>>();
  }

  getTreeNodes(browseTreeMode: BROWSE_TREE_MODE): Array<TreeNode> {
    return this._treeNodes.get(browseTreeMode);
  }

  setTreeNodes(value: Array<TreeNode>, browseTreeNode: BROWSE_TREE_MODE): void {
    this._treeNodes.set(browseTreeNode, value);
  }
}
