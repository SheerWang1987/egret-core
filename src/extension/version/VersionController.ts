/**
 * Copyright (c) 2014,Egret-Labs.org
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Egret-Labs.org nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY EGRET-LABS.ORG AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL EGRET-LABS.ORG AND CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
module egret {

    /**
     * @private
     */
    export class VersionController extends egret.EventDispatcher implements IVersionController {

        private _versionInfo:Object = {};
        private _versionPath:string = "";

        private _localFileArr:Array<string> = [];

        constructor() {
            super();

        }

        public fetchVersion():void {
            this._versionPath = "verson_yjtx.manifest";

            this._versionInfo = this.getLocalData(this._versionPath);

            this._localFileArr = [];
        }

        public checkIsNewVersion(url:string):boolean {
            var info:Object = this._versionInfo[url];
            if (info) {
                if (this._localFileArr.indexOf(info["v"]) >= 0) {
                    return true;
                }
                return false;
            }

            return true;
        }

        public saveVersion(url:string):void {
            this._localFileArr.push(this._versionInfo[url]["v"]);
        }

        /**
         * 获取所有有变化的文件
         * @returns {Array<any>}
         */
        public getChangeList():Array<any> {
            var temp:Array<any> = [];

            var localFileArr = this._localFileArr;
            for (var key in this._versionInfo) {
                if (localFileArr.indexOf(this._versionInfo[key]["v"]) < 0) {
                    temp.push(this._versionInfo[key]);
                }
            }

            return temp;
        }

        public getVirtualUrl(url:string):string {
            if (this._versionInfo[url]) {
                return this._versionInfo[url]["v"];
            }
            else {
                return url;
            }
        }

        private getLocalData(filePath):Object {
            if (egret_native.readUpdateFileSync && egret_native.readResourceFileSync) {
                //先取更新目录
                var content:string = egret_native.readUpdateFileSync(filePath);
                if (content != null) {
                    return JSON.parse(content);
                }

                //再取资源目录
                content = egret_native.readResourceFileSync(filePath);
                if (content != null) {
                    return JSON.parse(content);
                }

                return null;
            }
            else {
                return this.getLocalDataByOld(filePath);
            }
        }

        //todo 旧方式
        private getLocalDataByOld(filePath):Object {
            var data:Object = null;
            if (egret_native.isRecordExists(filePath)) {
                var str:string = egret_native.loadRecord(filePath);
                data = JSON.parse(str);
            }
            else if (egret_native.isFileExists(filePath)) {
                var str:string = egret_native.readFileSync(filePath);
                data = JSON.parse(str);
            }
            return data;
        }
    }
}
