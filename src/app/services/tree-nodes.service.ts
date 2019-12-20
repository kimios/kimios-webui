import {Injectable} from '@angular/core';
import {TreeNode} from 'angular-tree-component';

@Injectable({
  providedIn: 'root'
})
export class TreeNodesService {

  private _treeNodes: Array<TreeNode>;

  constructor() {
    this._treeNodes = new Array<TreeNode>();
  }

  get treeNodes(): Array<TreeNode> {
    return this._treeNodes;
  }

  set treeNodes(value: Array<TreeNode>) {
    this._treeNodes = value;
  }
}
