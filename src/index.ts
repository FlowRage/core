type InferValue<Prop extends PropertyKey, Desc> = Desc extends {
  get(): any;
  value: any;
}
  ? never
  : Desc extends { value: infer T }
  ? Record<Prop, T>
  : Desc extends { get(): infer T }
  ? Record<Prop, T>
  : never;

type DefineProperty<
  Prop extends PropertyKey,
  Desc extends PropertyDescriptor
> = Desc extends { writable: any; set(val: any): any }
  ? never
  : Desc extends { writable: any; get(): any }
  ? never
  : Desc extends { writable: false }
  ? Readonly<InferValue<Prop, Desc>>
  : Desc extends { writable: true }
  ? InferValue<Prop, Desc>
  : Readonly<InferValue<Prop, Desc>>;

function define<
  Obj extends object,
  Key extends PropertyKey,
  PDesc extends PropertyDescriptor
>(
  obj: Obj,
  prop: Key,
  val: PDesc
): asserts obj is Obj & DefineProperty<Key, PDesc> {
  Object.defineProperty(obj, prop, val);
}

export declare interface WrathCustomProperties {}

export declare type FlowInstance = {
  name: string;
  versin: string;

  use(plugins: Array<Plugin>): void;
} & WrathCustomProperties;

export declare type FlowOptions = {
  name: string;
};

export type PluginOptions = {
  context: FlowInstance;
  name: string;
  required: Array<string>;
};

export class Plugin {
  name: string;
  context: FlowInstance;
  required: Array<string>;
  constructor(options: PluginOptions) {
    this.name = options.name;
    this.context = options.context;
    this.required = options.required;
  }
}

export function createFlow(
  options: FlowOptions = { name: "FlowRage Gamemode" }
): FlowInstance {
  let flow: FlowInstance = Object.create({
    name: options.name,
    version: require("../package.json").version,
    use: (plugins: Array<Plugin>): void => {
      plugins.forEach((plugin) => {
        const required = plugin.required;

        define(flow, plugin.name, {
          writable: false,
          enumerable: true,
          configurable: true,
          value: plugin,
        });
      });
    },
  });

  return flow;
}
