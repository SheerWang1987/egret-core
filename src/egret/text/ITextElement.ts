/**
 * Created by huanghaiying on 15/3/5.
 */

module egret {

    /**
     * @private
     */
    export interface IHitTextElement {
        lineIndex:number;
        textElementIndex:number;
    }


    /**
     * @private
     */
    export interface ITextStyle {
        textColor?:number;
        strokeColor?:number;
        size?:number;
        stroke?:number;
        bold?:boolean;
        italic?:boolean;
        fontFamily?:string;
        href?:string;
    }

    /**
     * 用于建立多种样式混合文本的基本结构，主要用于设置 textFlow 属性
     * @link http://docs.egret-labs.org/jkdoc/manual-text-multiformat.html 多种样式文本混合
     */
    export interface ITextElement {
        text:string;
        style?:ITextStyle;
    }

    /**
     * @private
     */
    export interface IWTextElement extends ITextElement {
        width:number;
    }

    /**
     * @private
     */
    export interface ILineElement {
        width:number;
        height:number;
        charNum:number;

        elements:Array<IWTextElement>;
    }
}