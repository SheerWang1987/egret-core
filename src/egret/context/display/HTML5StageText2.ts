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
     * @classdesc
     * @extends egret.StageText
     * @private
     */
    export class HTML5StageText extends StageText {

        constructor() {
            super();
            HTMLInput.getInstance();
        }

        public _addListeners():void {
        }

        public _removeListeners():void {
        }

        private _isNeedShow:boolean = false;
        private inputElement:any = null;
        private inputDiv:any = null;

        public _initElement(x:number, y:number, cX:number, cY:number):void {
            var scaleX = egret.StageDelegate.getInstance().getScaleX();
            var scaleY = egret.StageDelegate.getInstance().getScaleY();

            this.inputDiv.position.x = 0;//x * scaleX;
            this.inputDiv.position.y = y * scaleY;

            this.inputDiv.scale.x = scaleX * cX;
            this.inputDiv.scale.y = scaleY * cY;

            this.inputDiv.transforms();
        }

        private _oppositeSelectionEnd:number = 0;
        public _show(multiline:boolean, size:number, width:number, height:number, oppositeSelectionEnd:number):void {
            this._multiline = multiline;
            this._oppositeSelectionEnd = oppositeSelectionEnd;
            if (!HTMLInput.getInstance().isCurrentStageText(this)) {
                this.inputElement = HTMLInput.getInstance().getInputElement(this);
                this.inputDiv = this.inputElement.parentNode;
                this.inputElement.style.width = 1 + "px";
                this.inputElement.style.height = height + "px";

                if (this._maxChars > 0) {
                    this.inputElement.setAttribute("maxlength", this._maxChars);
                }
                else {
                    this.inputElement.removeAttribute("maxlength");
                }
            }
            else {
                this.inputElement.onblur = null;
            }

            this._isNeedShow = true;
        }

        private onBlurHandler():void {
            HTMLInput.getInstance().clearInputElement();
            window.scrollTo(0, 0);
        }

        private executeShow():void {
            //打开
            var txt = this._getText();
            this.inputElement.value = txt;
            var self = this;

            if (this.inputElement.onblur == null) {
                this.inputElement.onblur = this.onBlurHandler;
            }

            this.inputElement.focus();
            this.inputElement.selectionStart = this.inputElement.value.length - this._oppositeSelectionEnd;
            this.inputElement.selectionEnd = this.inputElement.value.length - this._oppositeSelectionEnd;
        }

        private _isNeesHide:boolean = false;

        public _hide():void {
            //this._isNeesHide = true;
            //
            //this.executeHide();
        }

        private executeHide():void {
            if (this.inputElement == null) {//暂未
                return;
            }

            HTMLInput.getInstance().disconnectStageText(this);
            this.inputElement = null;
            this.inputDiv = null;
        }

        private textValue:string = "";

        public _getText():string {
            if (!this.textValue) {
                this.textValue = "";
            }
            return this.textValue;
        }

        public _setText(value:string):void {
            this.textValue = value;

            this.resetText();
        }

        private resetText():void {
            if (this.inputElement) {
                this.inputElement.value = this.textValue;
            }
        }

        public onInput(isBack:boolean):void {
            var self = this;
            if (!self._multiline && self.inputElement.value.match(/\r|\n/)) {
                self.inputElement.value = self.inputElement.value.replace(/\r|\n/g, "");

                self.inputElement.selectionStart = Math.min(self.inputElement.selectionStart, self.inputElement.value.length - self._oppositeSelectionEnd);
                self.inputElement.selectionEnd = self.inputElement.value.length - self._oppositeSelectionEnd;
            }

            self.textValue = self.inputElement.value;

            egret.Event.dispatchEvent(self, "updateText", false, {"isBack":isBack});
            //self.dispatchEvent(new egret.Event("updateText"));
        }

        public onDirectionKeyHandler(e):void {
            var self = this;
            self.inputElement.selectionStart = Math.min(self.inputElement.selectionStart, self.inputElement.value.length - self._oppositeSelectionEnd);
            self.inputElement.selectionEnd = self.inputElement.value.length - self._oppositeSelectionEnd;
        }

        public onClickHandler(e):void {
            if (this._isNeedShow) {
                e.stopPropagation();
                e.preventDefault();
                this._isNeedShow = false;

                this.executeShow();
            }
            //else if (this._isNeesHide) {
            //    e.stopPropagation();
            //    e.preventDefault();
            //    this._isNeesHide = false;
            //
            //    this.executeHide();
            //}
        }

        public onDisconnect():void {
            this.inputElement = null;

            this.dispatchEvent(new egret.Event("blur"));
        }
    }

    export class HTMLInput {
        private _stageText:HTML5StageText;
        private _inputElement:any;
        private _inputDIV:any;

        public isInputOn():boolean {
            return this._stageText != null;
        }

        public isCurrentStageText(stageText):boolean {
            return this._stageText == stageText;
        }

        private initStageDelegateDiv():any {
            var stageDelegateDiv = egret.Browser.getInstance().$("#StageDelegateDiv");
            if (!stageDelegateDiv) {
                stageDelegateDiv = egret.Browser.getInstance().$new("div");
                stageDelegateDiv.id = "StageDelegateDiv";
                var container = document.getElementById(egret.StageDelegate.canvas_div_name);
                container.appendChild(stageDelegateDiv);
                stageDelegateDiv.transforms();
                stageDelegateDiv.style.position = "absolute";
                stageDelegateDiv.style.left = "0px";
                stageDelegateDiv.style.top = "0px";
                stageDelegateDiv.style.width = "0px";
                stageDelegateDiv.style.height = "0px";
                stageDelegateDiv.style.border = "none";
                stageDelegateDiv.style.padding = "0";

                this._inputDIV = egret.Browser.getInstance().$new("div");
                this._inputDIV.style.position = "absolute";
                this._inputDIV.style.width = "0px";
                this._inputDIV.style.height = "0px";
                this._inputDIV.style.border = "none";
                this._inputDIV.style.padding = "0";
                this._inputDIV.position.x = 0;
                this._inputDIV.position.y = -100;
                this._inputDIV.scale.x = 1;
                this._inputDIV.scale.y = 1;
                this._inputDIV.transforms();
                this._inputDIV.style[this.getTrans("transformOrigin")] = "0% 0% 0px";
                stageDelegateDiv.appendChild(this._inputDIV);

                //增加1个空的textarea
                var inputElement:any = document.createElement("textarea");
                inputElement.style.position = "absolute";
                inputElement.style["resize"] = "none";
                inputElement.id = "egretTextarea";
                this._inputDIV.appendChild(inputElement);
                inputElement.type = "text";
                inputElement.setAttribute("tabindex", "-1");
                inputElement.style.width = "1px";
                inputElement.style.height = "12px";
                inputElement.style.border = "none";
                inputElement.style.padding = "0";
                inputElement.style.left = "0px";
                inputElement.style.top = "0px";

                //完全隐藏输入框///////////////////////////
                //隐藏光标  ios 0   pc 1
                var userAgent:string = navigator.userAgent;
                if (userAgent.indexOf("Mac OS X") >= 0 || userAgent.indexOf("Android") >= 0) {
                    inputElement.style.fontSize = 12 + "px";
                }
                else if (userAgent.indexOf("Windows") >= 0 && userAgent.indexOf("IEMobile") < 0 ) {
                    inputElement.style.fontSize = 12 + "px";
                }
                else {
                    inputElement.style.fontSize = 0 + "px";
                }
                //隐藏输入框
                inputElement.style.opacity = 0;
                //////////////////////////////////////

                var isBack:boolean;
                inputElement.onkeyup = function (e) {
                    isBack = e.keyCode == 8;
                    if (self._stageText) {
                        if (e.keyCode >= 37 && e.keyCode <= 40) {
                            self._stageText.onDirectionKeyHandler(e);
                        }
                    }
                };

                inputElement.oninput = function () {
                    if (self._stageText) {
                        self._stageText.onInput(isBack);
                    }
                };

                var self = this;
                self._inputElement = inputElement;
                container.addEventListener("click", function (e) {
                    if (self._stageText) {
                        self._stageText.onClickHandler(e);
                    }
                });
            }
        }

        public initInput():void {

            HTMLInput.getInstance().clearInputElement();
        }

        public disconnectStageText(stageText):void {
            if (this._stageText == stageText) {
                this.clearInputElement();

                this._inputElement.blur();
            }
        }

        public clearInputElement():void {
            if (this._inputElement) {
                this._inputElement.value = "";

                this._inputElement.onblur = null;

                this._inputElement.style.height = "12px";
                this._inputElement.style.left = "0px";
                this._inputElement.style.top = "0px";

                this._inputDIV.position.x = 0;
                this._inputDIV.position.y = -100;
                this._inputDIV.transforms();
            }

            if (this._stageText) {
                this._stageText.onDisconnect();
                this._stageText = null;
            }
        }

        public getInputElement(stageText):any {
            this.clearInputElement();

            this._stageText = stageText;

            return this._inputElement;
        }

        private header:string = "";

        /**
         * 获取当前浏览器类型
         * @type {string}
         */
        private getTrans(type:string):string {
            if (this.header == "") {
                this.header = this.getHeader();
            }

            return this.header + type.substring(1, type.length);
        }

        /**
         * 获取当前浏览器的类型
         * @returns {string}
         */
        private getHeader():string {
            var tempStyle = document.createElement('div').style;
            var transArr:Array<string> = ["t", "webkitT", "msT", "MozT", "OT"];
            for (var i:number = 0; i < transArr.length; i++) {
                var transform:string = transArr[i] + 'ransform';

                if (transform in tempStyle)
                    return transArr[i];
            }

            return transArr[0];
        }

        private static _instance:HTMLInput;

        public static getInstance():HTMLInput {
            if (HTMLInput._instance == null) {
                HTMLInput._instance = new egret.HTMLInput();
                HTMLInput._instance.initStageDelegateDiv();
            }

            return HTMLInput._instance;
        }


    }
}

egret.StageText.create = function () {
    return new egret.HTML5StageText();
};