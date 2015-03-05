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
        public _show(multiline:boolean, size:number, width:number, height:number):void {
            this._multiline = multiline;
            this.inputElement = HTMLInput.getInstance().getInputElement(this);

            //this.inputElement.style.fontSize = size + "px";
            //this.inputElement.style.width = width + "px";
            //this.inputElement.style.height = height + "px";
            //this.inputElement.style.fontStyle = "normal";
            //this.inputElement.style.fontWeight = "normal";

            if (this._maxChars > 0) {
                this.inputElement.setAttribute("maxlength", this._maxChars);
            }
            else {
                this.inputElement.removeAttribute("maxlength");
            }

            this._isNeedShow = true;
        }

        private executeShow():void {
            //打开
            var txt = this._getText();
            this.inputElement.value = txt;
            var self = this;

            this.inputElement.focus();
            this.inputElement.selectionStart = txt.length;
            this.inputElement.selectionEnd = txt.length;
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

        public onInput():void {
            var self = this;
            if (!self._multiline) {
                self.inputElement.value = self.inputElement.value.replace(/\r|\n/g, "");
            }

            self.textValue = self.inputElement.value;
            self.dispatchEvent(new egret.Event("updateText"));
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
        private initStageDelegateDiv():any {
            var stageDelegateDiv = egret.Browser.getInstance().$("#StageDelegateDiv");
            if (!stageDelegateDiv) {
                stageDelegateDiv = egret.Browser.getInstance().$new("div");
                stageDelegateDiv.id = "StageDelegateDiv";
                stageDelegateDiv.style.position = "absolute";
                var container = document.getElementById(egret.StageDelegate.canvas_div_name);
                container.appendChild(stageDelegateDiv);
                stageDelegateDiv.transforms();
                stageDelegateDiv.style.left = "0px";
                stageDelegateDiv.style.top = "-100px";
                stageDelegateDiv.style.width = "0px";
                stageDelegateDiv.style.overflow = "hidden";


                //增加1个空的input和1个空的textarea
                var inputElement:any = document.createElement("textarea");
                inputElement.style["resize"] = "none";
                inputElement.id = "egretTextarea";
                stageDelegateDiv.appendChild(inputElement);
                inputElement.type = "text";
                inputElement.setAttribute("tabindex", "-1");
                inputElement.style.width = "0px";
                inputElement.style.height = "0px";
                inputElement.style.border = "none";

                inputElement.onkeyup = function (e) {
                    if (self._stageText) {
                        if (e.keyCode >= 37 && e.keyCode <= 40) {
                            //self._stageText.onInput();
                            inputElement.selectionStart = inputElement.value.length;
                            inputElement.selectionEnd = inputElement.value.length;
                        }
                    }
                };

                inputElement.oninput = function () {
                    if (self._stageText) {
                        self._stageText.onInput();
                    }
                };

                inputElement.onblur = function() {
                    if (self._stageText) {
                        self.clearInputElement();
                        window.scrollTo(0, 0);
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

        public disconnectStageText(stageText):void {
            if (this._stageText == stageText) {
                this.clearInputElement();

                this._inputElement.blur();
            }
        }

        public clearInputElement():void {
            if (this._inputElement) {
                this._inputElement.value = "";
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

egret.StageText.create = function(){
    return new egret.HTML5StageText();
};