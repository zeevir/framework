import * as React from 'react'
import { ModifiableEntity, Lite, Entity, is, getToString } from '../Signum.Entities'
import { FormGroup } from './FormGroup'
import { EntityListBaseController, EntityListBaseProps } from './EntityListBase'
import { useController } from './LineBase';

export interface EntityListProps extends EntityListBaseProps {
  size?: number;
}

export class EntityListController extends EntityListBaseController<EntityListProps>
{
  moveUp(index: number) {
    super.moveUp(index);
    this.forceUpdate();
  }

  moveDown(index: number) {
    super.moveDown(index);
    this.forceUpdate();
  }

  handleOnSelect = (e: React.FormEvent<HTMLSelectElement>) => {
    this.forceUpdate();
  }


  selectElement?: HTMLSelectElement | null;
  handleSelectLoad = (sel: HTMLSelectElement | null) => {
    let refresh = this.selectElement == undefined && sel;

    this.selectElement = sel;

    if (refresh)
      this.forceUpdate();
  }

  getSelectedIndex(): number | undefined {
    if (this.selectElement == null || this.selectElement.selectedIndex == -1)
      return undefined;


    var list = this.props.ctx.value;
    if (list.length <= this.selectElement.selectedIndex)
      return undefined;

    return this.selectElement.selectedIndex;
  }

  handleRemoveClick = (event: React.SyntheticEvent<any>) => {

    event.preventDefault();

    const p = this.props;
    var list = p.ctx.value!;
    var selectedIndex = this.getSelectedIndex()!;

    (p.onRemove ? p.onRemove(list[selectedIndex].element) : Promise.resolve(true))
      .then(result => {
        if (result == false)
          return;

        list.removeAt(selectedIndex!);

        this.setValue(list);
      })
      .done();
  };

  handleViewClick = (event: React.MouseEvent<any>) => {

    event.preventDefault();

    const ctx = this.props.ctx;
    const selectedIndex = this.getSelectedIndex()!;
    const list = ctx.value!;
    const entity = list[selectedIndex].element;

    const pr = ctx.propertyRoute.addLambda(a => a[0]);

    const openWindow = (event.button == 1 || event.ctrlKey) && !this.props.type!.isEmbedded;

    const promise = this.props.onView ?
      this.props.onView(entity, pr) :
      this.defaultView(entity, pr);

    if (promise == null)
      return;

    promise.then(e => {
      if (e == undefined)
        return;

      this.convert(e).then(m => {
        if (is(list[selectedIndex].element as Entity, e as Entity)) {
          list[selectedIndex].element = m;
          if (e.modified)
            this.setValue(list);
        }
        else {
          list[selectedIndex] = { rowId: null, element: m };
          this.setValue(list);
        }
      }).done();
    }).done();
  }

  getTitle(e: Lite<Entity> | ModifiableEntity) {

    const pr = this.props.ctx.propertyRoute;

    const type = pr && pr.member && pr.member.typeNiceName || (e as Lite<Entity>).EntityType || (e as ModifiableEntity).Type;

    const id = (e as Lite<Entity>).id || (e as Entity).id;

    return type + (id ? " " + id : "");
  }
}


export const EntityList = React.forwardRef(function EntityList(props: EntityListProps, ref: React.Ref<EntityListController>) {
  const c = useController(EntityListController, props, ref);
  const p = c.props;
  const list = p.ctx.value!;

  const selectedIndex = c.getSelectedIndex();

  if (c.isHidden)
    return null;

  return (
    <FormGroup ctx={p.ctx} labelText={p.labelText}
      htmlAttributes={{ ...c.baseHtmlAttributes(), ...p.formGroupHtmlAttributes }}
      labelHtmlAttributes={p.labelHtmlAttributes}>
      <div className="sf-entity-line">
        <div className={p.ctx.inputGroupClass}>
          <select className={p.ctx.formControlClass} size={p.size} onChange={c.handleOnSelect} ref={c.handleSelectLoad}>
            {list.map(mle => <option key={c.keyGenerator.getKey(mle)} title={p.ctx.titleLabels ? c.getTitle(mle.element) : undefined} {...EntityListBaseController.entityHtmlAttributes(mle.element)}>{getToString(mle.element)}</option>)}
          </select>
          <span className="input-group-append input-group-vertical">
            {c.renderCreateButton(true)}
            {c.renderFindButton(true)}
            {selectedIndex != undefined && c.renderViewButton(true, list[selectedIndex].element)}
            {selectedIndex != undefined && c.renderRemoveButton(true, list[selectedIndex].element)}
            {selectedIndex != undefined && p.move && selectedIndex != null && selectedIndex > 0 && c.renderMoveUp(true, selectedIndex!)}
            {selectedIndex != undefined && p.move && selectedIndex != null && selectedIndex < list.length - 1 && c.renderMoveDown(true, selectedIndex!)}
          </span>
        </div>
      </div>
    </FormGroup>
  );
});
