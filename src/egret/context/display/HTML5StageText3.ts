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

        private _isNeedShow:boolean = false;
        private inputElement:any = null;
        private inputDiv:any = null;

        public _initElement(x:number, y:number, cX:number, cY:number):void {
            var scaleX = egret.StageDelegate.getInstance().getScaleX();
            var scaleY = egret.StageDelegate.getInstance().getScaleY();

            this.inputDiv.position.x = x * scaleX;
            this.inputDiv.position.y = y * scaleY;

            this.inputDiv.scale.x = scaleX * cX;
            this.inputDiv.scale.y = scaleY * cY;

            this.inputDiv.transforms();
        }

        public _show(multiline:boolean, size:number, width:number, height:number, oppositeSelectionEnd:number):void {
            this._multiline = multiline;
            if (!HTMLInput.getInstance().isCurrentStageText(this)) {
                this.inputElement = HTMLInput.getInstance().getInputElement(this);

                this.inputDiv = HTMLInput.getInstance()._inputDIV;
            }
            else {
                this.inputElement.onblur = null;
            }

            //标记当前文本被选中
            this._isNeedShow = true;
        }

        private onBlurHandler():void {
            HTMLInput.getInstance().clearInputElement();
            window.scrollTo(0, 0);
        }

        private executeShow():void {
            var self = this;
            //打开
            this.inputElement.value = this._getText();

            if (this.inputElement.onblur == null) {
                this.inputElement.onblur = this.onBlurHandler;
            }

            this._resetStageText();

            if (this._textfield._maxChars > 0) {
                this.inputElement.setAttribute("maxlength", this._textfield._maxChars);
            }
            else {
                this.inputElement.removeAttribute("maxlength");
            }

            this.inputElement.selectionStart = this.inputElement.value.length;
            this.inputElement.selectionEnd = this.inputElement.value.length;
            this.inputElement.focus();
        }

        private _isNeesHide:boolean = false;
        public _hide():void {
            //标记当前点击其他地方关闭
            this._isNeesHide = true;
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

        public _onInput():void {
            var self = this;
            self.textValue = self.inputElement.value;

            egret.Event.dispatchEvent(self, "updateText", false);
        }

        public _onClickHandler(e):void {
            if (this._isNeedShow) {
                e.stopImmediatePropagation();
                //e.preventDefault();
                this._isNeedShow = false;

                this.executeShow();

                this.dispatchEvent(new egret.Event("focus"));
            }
        }

        public _onDisconnect():void {
            this.inputElement = null;

            this.dispatchEvent(new egret.Event("blur"));
        }

        private _styleInfoes:Object = {};
        private setElementStyle(style:string, value:any):void {
            if (this.inputElement) {
                if (this._styleInfoes[style] != value) {
                    this.inputElement.style[style] = value;
                    //this._styleInfoes[style] = value;
                }
            }
        }

        public _removeInput():void {
            if (this.inputElement) {
                HTMLInput.getInstance().disconnectStageText(this);
            }
        }

        /**
         * 修改位置
         * @private
         */
        public _resetStageText():void {
            if (this.inputElement) {
                var textfield:egret.TextField = this._textfield;
                this.setElementStyle("fontFamily", textfield._fontFamily);
                this.setElementStyle("fontStyle", textfield._italic ? "italic" : "normal");
                this.setElementStyle("fontWeight", textfield._bold ? "bold" : "normal");
                this.setElementStyle("textAlign", textfield._textAlign);
                this.setElementStyle("fontSize", textfield._size + "px");
                this.setElementStyle("lineHeight", textfield._size + "px");
                this.setElementStyle("color", textfield._textColorString);
                this.setElementStyle("width", textfield._getSize(Rectangle.identity).width + "px");
                this.setElementStyle("height", textfield._getSize(Rectangle.identity).height + "px");
                this.setElementStyle("verticalAlign", textfield._verticalAlign);
            }
        }
    }

    export class HTMLInput {
        private _stageText:HTML5StageText;

        private _simpleElement:any;
        private _multiElement:any;

        private _inputElement:any;
        public _inputDIV:any;

        public isInputOn():boolean {
            return this._stageText != null;
        }

        public isCurrentStageText(stageText):boolean {
            return this._stageText == stageText;
        }

        private initValue(dom:any):void {
            dom.style.position = "absolute";
            dom.style.left = "0px";
            dom.style.top = "0px";
            dom.style.border = "none";
            dom.style.padding = "0";
        }

        private initStageDelegateDiv():any {
            var stageDelegateDiv = egret.Browser.getInstance().$("#StageDelegateDiv");
            if (!stageDelegateDiv) {
                stageDelegateDiv = egret.Browser.getInstance().$new("div");
                stageDelegateDiv.id = "StageDelegateDiv";
                var container = document.getElementById(egret.StageDelegate.egret_root_div);
                container.appendChild(stageDelegateDiv);
                stageDelegateDiv.transforms();

                this.initValue(stageDelegateDiv);

                stageDelegateDiv.style.width = "0px";
                stageDelegateDiv.style.height = "0px";

                this._inputDIV = egret.Browser.getInstance().$new("div");
                this.initValue(this._inputDIV);
                this._inputDIV.style.width = "0px";
                this._inputDIV.style.height = "0px";

                this._inputDIV.position.x = 0;
                this._inputDIV.position.y = -100;
                this._inputDIV.scale.x = 1;
                this._inputDIV.scale.y = 1;
                this._inputDIV.transforms();
                this._inputDIV.style[this.getTrans("transformOrigin")] = "0% 0% 0px";
                stageDelegateDiv.appendChild(this._inputDIV);

                var self = this;
                var canvasDiv = document.getElementById(egret.StageDelegate.canvas_div_name);
                canvasDiv.addEventListener("click", function (e) {
                    if (self._stageText) {
                        egret.MainContext.instance.stage._changeSizeDispatchFlag = false;
                        self._stageText._onClickHandler(e);

                        HTMLInput.getInstance().show();
                    }
                });

                this.initInputElement(true);
                this.initInputElement(false);
            }
        }

        private initInputElement(multiline:boolean):void {
            var self = this;

            //增加1个空的textarea
            var inputElement:any;
            if (multiline) {
                inputElement = document.createElement("textarea");
                inputElement.style["resize"] = "none";
                this._multiElement = inputElement;
                inputElement.id = "egretTextarea";
            }
            else {
                inputElement = document.createElement("input");
                this._simpleElement = inputElement;
                inputElement.id = "egretInput";
            }

            inputElement.type = "text";

            this._inputDIV.appendChild(inputElement);
            inputElement.setAttribute("tabindex", "-1");
            inputElement.style.width = "1px";
            inputElement.style.height = "12px";

            this.initValue(inputElement);
            inputElement.style.outline = "thin";
            inputElement.style.background = "none";

            inputElement.style.overflow = "hidden";
            inputElement.style.wordBreak = "break-all";

            //隐藏输入框
            inputElement.style.opacity = 0;

            inputElement.oninput = function () {
                if (self._stageText) {
                    self._stageText._onInput();
                }
            };

            /*var call = function(e){
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
            };
            inputElement.addEventListener("click", call);

            inputElement.addEventListener("MSPointerDown", call);
            inputElement.addEventListener("MSPointerMove", call);
            inputElement.addEventListener("MSPointerUp", call);

            inputElement.addEventListener("mousedown", call);
            inputElement.addEventListener("mousemove", call);
            inputElement.addEventListener("mouseup", call);

            inputElement.addEventListener("touchstart", call);
            inputElement.addEventListener("touchmove", call);
            inputElement.addEventListener("touchend", call);
            inputElement.addEventListener("touchcancel", call);*/
        }

        public show():void {
            var inputElement = this._inputElement;
            var self = this;
            //隐藏输入框
            egret.__callAsync(function () {
                inputElement.style.opacity = 1;
            }, this);
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

                this._inputElement.style.width = "1px";
                this._inputElement.style.height = "12px";
                this._inputElement.style.left = "0px";
                this._inputElement.style.top = "0px";
                this._inputElement.style.opacity = 0;
                this._inputElement.style.fontSize = 0 + "px";

                var otherElement;
                if (this._simpleElement == this._inputElement) {
                    otherElement = this._multiElement;
                }
                else {
                    otherElement = this._simpleElement;
                }

                if (otherElement.parentNode == null) {
                    //this._inputDIV.appendChild(otherElement);
                }
                otherElement.style.display = "block";

                this._inputDIV.position.x = 0;
                this._inputDIV.position.y = -100;
                this._inputDIV.transforms();
            }

            if (this._stageText) {
                this._stageText._onDisconnect();
                this._stageText = null;
            }
            egret.MainContext.instance.stage._changeSizeDispatchFlag = true;
        }

        public getInputElement(stageText):any {
            this.clearInputElement();

            this._stageText = stageText;

            if (this._stageText._multiline) {
                this._inputElement = this._multiElement;
            }
            else {
                this._inputElement = this._simpleElement;
            }


            var otherElement;
            if (this._simpleElement == this._inputElement) {
                otherElement = this._multiElement;
            }
            else {
                otherElement = this._simpleElement;
            }

            if (otherElement.parentNode) {
                //otherElement.parentNode.removeChild(otherElement);
            }
            otherElement.style.display = "none";

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