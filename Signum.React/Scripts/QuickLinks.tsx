import * as React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { getTypeInfo, getQueryNiceName, getQueryKey, getTypeName, Type } from './Reflection'
import { classes, Dic } from './Globals'
import { FindOptions } from './FindOptions'
import * as Finder from './Finder'
import * as Navigator from './Navigator'
import { ModifiableEntity, QuickLinkMessage, Lite, Entity, toLiteFat, is } from './Signum.Entities'
import { onWidgets, WidgetContext } from './Frames/Widgets'
import { onContextualItems, ContextualItemsContext, MenuItemBlock } from './SearchControl/ContextualItems'
import { useAPI } from './Hooks';
import { StyleContext } from './Lines'
import { Dropdown } from 'react-bootstrap'
import DropdownToggle from 'react-bootstrap/DropdownToggle'

export function start() {

  onWidgets.push(getQuickLinkWidget);
  onContextualItems.push(getQuickLinkContextMenus);

  Navigator.clearSettingsActions.push(clearQuickLinks);
}

export interface QuickLinkContext<T extends Entity> {
  lite: Lite<T>;
  lites: Lite<T>[];
  widgetContext?: WidgetContext<T>;
  contextualContext?: ContextualItemsContext<T>;
}

type Seq<T> = (T | undefined)[] | T | undefined;

export function clearQuickLinks() {
  onGlobalQuickLinks.clear();
  Dic.clear(onQuickLinks);
}

export interface RegisteredQuickLink<T extends Entity> {
  factory: (ctx: QuickLinkContext<T>) => Seq<QuickLink> | Promise<Seq<QuickLink>>;
  options?: QuickLinkOptions;
}

export interface QuickLinkOptions {
  allowsMultiple?: boolean
}

export const onGlobalQuickLinks: Array<RegisteredQuickLink<Entity>> = [];
export function registerGlobalQuickLink(quickLinkGenerator: (ctx: QuickLinkContext<Entity>) => Seq<QuickLink> | Promise<Seq<QuickLink>>, options?: QuickLinkOptions) {
  onGlobalQuickLinks.push({ factory: quickLinkGenerator,  options: options });
}

export const onQuickLinks: { [typeName: string]: Array<RegisteredQuickLink<any>> } = {};
export function registerQuickLink<T extends Entity>(type: Type<T>, quickLinkGenerator: (ctx: QuickLinkContext<T>) => Seq<QuickLink> | Promise<Seq<QuickLink>>, options?: QuickLinkOptions) {
  const typeName = getTypeName(type);

  const col = onQuickLinks[typeName] || (onQuickLinks[typeName] = []);

  col.push({ factory: quickLinkGenerator, options: options });
}

export var ignoreErrors = false;

export function setIgnoreErrors(value: boolean) {
  ignoreErrors = value;
}

export function getQuickLinks(ctx: QuickLinkContext<Entity>): Promise<QuickLink[]> {

  let promises = onGlobalQuickLinks.filter(a => a.options && a.options.allowsMultiple || ctx.lites.length == 1).map(f => safeCall(f.factory, ctx));

  if (onQuickLinks[ctx.lite.EntityType]) {
    const specificPromises = onQuickLinks[ctx.lite.EntityType].filter(a => a.options && a.options.allowsMultiple || ctx.lites.length == 1).map(f => safeCall(f.factory, ctx));

    promises = promises.concat(specificPromises);
  }

  return Promise.all(promises).then(links => links.flatMap(a => a || []).filter(a => a && a.isVisible).orderBy(a => a.order));
}


function safeCall(f: (ctx: QuickLinkContext<Entity>) => Seq<QuickLink> | Promise<Seq<QuickLink>>, ctx: QuickLinkContext<Entity>): Promise<QuickLink[]> {
  if (!ignoreErrors)
    return asPromiseArray<QuickLink>(f(ctx));
  else {
    try {
      return asPromiseArray<QuickLink>(f(ctx)).catch(e => {
        console.error(e);
        return [];
      })
    } catch (e) {
      console.error(e);
      return Promise.resolve([]);
    }
  }
}

function asPromiseArray<T>(value: Seq<T> | Promise<Seq<T>>): Promise<T[]> {

  if (!value)
    return Promise.resolve([] as T[]);

  if ((value as Promise<Seq<T>>).then)
    return (value as Promise<Seq<T>>).then(a => asArray(a));

  return Promise.resolve(asArray(value as Seq<T>))
}

function asArray<T>(valueOrArray: Seq<T>): T[] {
  if (!valueOrArray)
    return [];

  if (Array.isArray(valueOrArray))
    return valueOrArray.filter(a => a != null).map(a => a!);
  else
    return [valueOrArray];
}

export function getQuickLinkWidget(ctx: WidgetContext<ModifiableEntity>): React.ReactElement<any> {

  return <QuickLinkWidget wc={ctx} />;
}

export function getQuickLinkContextMenus(ctx: ContextualItemsContext<Entity>): Promise<MenuItemBlock | undefined> {

  if (ctx.lites.length == 0)
    return Promise.resolve(undefined);

  return getQuickLinks({
    lite: ctx.lites[0],
    lites: ctx.lites,
    contextualContext: ctx
  }).then(links => {

    if (links.length == 0)
      return undefined;

    return {
      header: QuickLinkMessage.Quicklinks.niceToString(),
      menuItems: links.map(ql => ql.toDropDownItem())
    } as MenuItemBlock;
  });
}

export interface QuickLinkWidgetProps {
  wc: WidgetContext<ModifiableEntity>
}

export function QuickLinkWidget(p: QuickLinkWidgetProps) {

  const entity = p.wc.ctx.value;

  const links = useAPI(signal => {
    if (entity.isNew || !getTypeInfo(entity.Type) || !getTypeInfo(entity.Type).entityKind)
      return Promise.resolve([]);
    else
      return getQuickLinks({
        lite: toLiteFat(entity as Entity),
        lites: [toLiteFat(entity as Entity)],
        widgetContext: p.wc as WidgetContext<Entity>
      });
  }, [p]);

  if (links != undefined && links.length == 0)
    return null;

  const DDToggle = Dropdown.Toggle as any;

  return (
    <Dropdown id="quickLinksWidget">
      <DDToggle as={QuickLinkToggle} links={links} />
      <Dropdown.Menu alignRight>
        {!links ? [] : links.orderBy(a => a.order).map((a, i) => React.cloneElement(a.toDropDownItem(), { key: i }))}
      </Dropdown.Menu>
    </Dropdown>
  );
}


class QuickLinkToggle extends React.Component<{ onClick?: (e: React.MouseEvent<any>) => void, links: any[] | undefined }> {

  handleClick = (e: React.MouseEvent<any>) => {
    e.preventDefault();
    this.props.onClick!(e);
  }

  render() {
    const links = this.props.links;
    return (
      <a
        className={classes("badge badge-pill", links && links.some(l => !l.isShy) ? "badge-warning" : "badge-light", "sf-quicklinks")}
        title={StyleContext.default.titleLabels ? QuickLinkMessage.Quicklinks.niceToString() : undefined}
        role="button"
        href="#"
        data-toggle="dropdown"
        onClick={this.handleClick} >
        {links && <FontAwesomeIcon icon="star" />}
        {links ? "\u00A0" + links.length : "…"}
      </a>
    );
  }
}

export interface QuickLinkOptions {
  isVisible?: boolean;
  text?: string;
  order?: number;
  icon?: IconProp;
  iconColor?: string;
  isShy?: boolean;
}

export abstract class QuickLink {
  isVisible!: boolean;
  text!: string;
  order!: number;
  name: string;
  icon?: IconProp;
  iconColor?: string;
  isShy?: string;

  constructor(name: string, options?: QuickLinkOptions) {
    this.name = name;

    Dic.assign(this, { isVisible: true, text: "", order: 0, ...options });
  }

  abstract toDropDownItem(): React.ReactElement<any>;

  renderIcon() {
    if (this.icon == undefined)
      return undefined;

    return (
      <FontAwesomeIcon icon={this.icon} className="icon" color={this.iconColor} />
    );
  }
}

export class QuickLinkAction extends QuickLink {
  action: (e: React.MouseEvent<any>) => void;

  constructor(name: string, text: string, action: (e: React.MouseEvent<any>) => void, options?: QuickLinkOptions) {
    super(name, options);
    this.text = text;
    this.action = action;
  }

  toDropDownItem() {

    return (
      <Dropdown.Item data-name={this.name} className="sf-quick-link" onMouseUp={this.handleClick}>
        {this.renderIcon()}&nbsp;{this.text}
      </Dropdown.Item>
    );
  }

  handleClick = (e: React.MouseEvent<any>) => {
    e.persist();
    this.action(e);
  }
}

export class QuickLinkLink extends QuickLink {
  url: string;

  constructor(name: string, text: string, url: string, options?: QuickLinkOptions) {
    super(name, options);
    this.text = text;
    this.url = url;
  }

  toDropDownItem() {

    return (
      <Dropdown.Item data-name={this.name} className="sf-quick-link" onMouseUp={this.handleClick}>
        {this.renderIcon()}&nbsp;{this.text}
      </Dropdown.Item>
    );
  }

  handleClick = (e: React.MouseEvent<any>) => {
    Navigator.pushOrOpenInTab(this.url, e);
  }
}

export class QuickLinkExplore extends QuickLink {
  findOptions: FindOptions;

  constructor(findOptions: FindOptions, options?: QuickLinkOptions) {
    super(getQueryKey(findOptions.queryName), {
      isVisible: Finder.isFindable(findOptions.queryName, false),
      text: getQueryNiceName(findOptions.queryName),
      ...options
    });

    this.findOptions = findOptions;
  }

  toDropDownItem() {
    return (
      <Dropdown.Item data-name={this.name} className="sf-quick-link" onMouseUp={this.exploreOrPopup}>
        {this.renderIcon()}&nbsp;{this.text}
      </Dropdown.Item>
    );
  }

  exploreOrPopup = (e: React.MouseEvent<any>) => {
    if (e.button == 2)
      return;

    if (e.ctrlKey || e.button == 1)
      window.open(Finder.findOptionsPath(this.findOptions));
    else
      Finder.explore(this.findOptions);
  }
}


export class QuickLinkNavigate extends QuickLink {
  lite: Lite<Entity>;
  viewName?: string;

  constructor(lite: Lite<Entity>, viewName?: string, options?: QuickLinkOptions) {
    super(lite.EntityType, {
      isVisible: Navigator.isNavigable(lite.EntityType),
      text: getTypeInfo(lite.EntityType).niceName,
      ...options
    });

    this.lite = lite;
    this.viewName = viewName;
  }

  toDropDownItem() {
    return (
      <Dropdown.Item data-name={this.name} className="sf-quick-link" onMouseUp={this.navigateOrPopup}>
        {this.renderIcon()}&nbsp;{this.text}
      </Dropdown.Item>
    );
  }

  navigateOrPopup = (e: React.MouseEvent<any>) => {
    if (e.button == 2)
      return;

    const es = Navigator.getSettings(this.lite.EntityType);
    if (e.ctrlKey || e.button == 1 || es && es.avoidPopup)
      window.open(Navigator.navigateRoute(this.lite, this.viewName));
    else
      Navigator.navigate(this.lite, { getViewPromise: e => this.viewName });
  }
}
