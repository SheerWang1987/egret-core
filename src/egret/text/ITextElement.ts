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
     * 文本最终解析的一行数据格式
     * @private
     */
    export interface ILineElement {
        /**
         * 文本占用宽度
         */
        width:number;
        /**
         * 文本占用高度
         */
        height:number;
        /**
         * 当前文本字符总数量（包括换行符）
         */
        charNum:number;
        /**
         * 是否含有换行符
         */
        hasNextLine:boolean;
        /**
         * 本行文本内容
         */
        elements:Array<IWTextElement>;
    }
}