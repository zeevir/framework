import * as React from 'react'
import { StyleContext, TypeContext } from '../Lines';
import { classes, addClass } from '../Globals';
import "./Lines.css"

export interface FormGroupProps {
  labelText?: React.ReactChild;
  controlId?: string;
  ctx: StyleContext;
  labelHtmlAttributes?: React.HTMLAttributes<HTMLLabelElement>;
  htmlAttributes?: React.HTMLAttributes<HTMLDivElement>;
  helpText?: React.ReactChild;
  children?: React.ReactNode;
}

export function FormGroup(p: FormGroupProps) {
  const ctx = p.ctx;
  const tCtx = ctx as TypeContext<any>;
  const errorClass = tCtx.errorClass;
  const errorAtts = tCtx.errorAttributes && tCtx.errorAttributes();

  if (ctx.formGroupStyle == "None") {
    const c = p.children as React.ReactElement<any>;

    return (
      <span {...p.htmlAttributes} className={errorClass} {...errorAtts}>
        {c}
      </span>
    );
  }

  const labelClasses = classes(
    ctx.formGroupStyle == "SrOnly" && "sr-only",
    ctx.formGroupStyle == "LabelColumns" && ctx.labelColumnsCss,
    ctx.formGroupStyle == "LabelColumns" ? ctx.colFormLabelClass : ctx.labelClass,
  );

  let pr = tCtx.propertyRoute;
  var labelText = p.labelText || (pr && pr.member && pr.member.niceName);
  const label = (
    <label htmlFor={p.controlId} {...p.labelHtmlAttributes} className={addClass(p.labelHtmlAttributes, labelClasses)} >
      {labelText}
    </label>
  );

  const formGroupClasses = classes(p.ctx.formGroupClass, p.ctx.formGroupStyle == "LabelColumns" ? "row" : undefined, errorClass);
  return (
    <div
      title={ctx.titleLabels && typeof labelText == "string" ? labelText : undefined}
      {...p.htmlAttributes}
      className={addClass(p.htmlAttributes, formGroupClasses)}
      {...errorAtts}>
      {ctx.formGroupStyle != "BasicDown" && label}
      {
        ctx.formGroupStyle != "LabelColumns" ? p.children :
          (
            <div className={p.ctx.valueColumnsCss} >
              {p.children}
              {p.helpText && ctx.formGroupStyle == "LabelColumns" && <small className="form-text text-muted">{p.helpText}</small>}
            </div>
          )
      }
      {ctx.formGroupStyle == "BasicDown" && label}
      {p.helpText && ctx.formGroupStyle != "LabelColumns" && <small className="form-text text-muted">{p.helpText}</small>}
    </div>
  );

}
