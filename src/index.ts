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

type PluginOptions = {
  context: FlowInstance;
  name: string;
  package: string;
  dependepcies: Array<PluginDependecie>;
} & FlowCustomPluginOptions;

type ContextPlugins = Array<{ name: string; package: string }>;

export type PluginDependecie = {
  name: string;
  package: string;
};

export class Plugin {
  name: string;
  context: FlowInstance;
  package: string;
  dependecies: Array<PluginDependecie>;
  dependeciesCheck: boolean;
  constructor(options: PluginOptions) {
    this.name = options.name;
    this.context = options.context;

    const PLUGIN = this;
    const FLOW = this.context;

    this.package = options.package;

    this.dependecies = options.dependepcies;

    function checkDependencies(): boolean {
      const PLUGINS = FLOW.plugins();
      let missedDependencies: Array<PluginDependecie> = [];

      for (let index = 0; index < PLUGIN.dependecies.length; index++) {
        let dependecie = PLUGIN.dependecies[index];

        if (
          !PLUGINS.some(
            (plugin) =>
              plugin.name === dependecie.name &&
              plugin.package === dependecie.package
          )
        ) {
          missedDependencies.push({
            name: dependecie.name,
            package: dependecie.package,
          });
        }
      }

      if (missedDependencies.length !== 0) {
        let missedNames: Array<string> = [];
        let missedPackages: Array<string> = [];

        for (let index = 0; index < missedDependencies.length; index++) {
          missedNames.push(missedDependencies[index].name);
          missedPackages.push(missedDependencies[index].package);
        }

        console.log(
          "Plugin %s missed dependencies: %s, you can install that with: npm install %s",
          PLUGIN.name,
          missedNames.join(", "),
          missedPackages.join(" ")
        );

        return false;
      } else {
        return true;
      }
    }

    this.dependeciesCheck = checkDependencies();
  }
}

export type FlowOptions = {
  name?: string;
  version?: string;
};

export type FlowPluginOptions = {
  name: string;
  package: string;
  dependepcies: Array<PluginDependecie>;
} & FlowCustomPluginOptions;

export declare interface FlowCustomProperties {}

export declare interface FlowCustomPluginOptions {}

export declare type FlowInstance = {
  name: string;
  version: string;

  plugins(): ContextPlugins;

  use(plugin: typeof Plugin, options: FlowPluginOptions): void;
} & FlowCustomProperties;

export function createFlow(
  options: FlowOptions = { name: "FlowRage Gamemode", version: "0.0.1" }
): FlowInstance {
  let flow: FlowInstance = Object.create({
    name: options.name,
    version: options.version,
    plugins: (): ContextPlugins => {
      const reserved = ["name", "version", "plugins", "use"];
      let result: ContextPlugins = [];

      const PluginProperties: Array<string> = Object.keys(flow).filter(
        (el) => !reserved.some((rs) => rs === el)
      );

      for (let index = 0; index < PluginProperties.length; index++) {
        const property = PluginProperties[index];

        const PLUGIN_NAME = flow[property].name;
        const PLUGIN_PACKAGE = flow[property].package;

        result.push({
          name: PLUGIN_NAME,
          package: PLUGIN_PACKAGE,
        });
      }

      return result;
    },
    use: (plugin: typeof Plugin, options: FlowPluginOptions): void => {
      const plug = new plugin({
        context: flow,
        ...options,
      });

      if (plug.dependeciesCheck) {
        const plugins = flow.plugins();

        if (!plugins.some((pl) => pl.name === plug.name)) {
          define(flow, plug.name, {
            writable: false,
            enumerable: true,
            configurable: true,
            value: plug,
          });
        } else {
          console.log("Plugin %s already defined", plug.name);
        }
      }
    },
  });

  return flow;
}
