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

export declare module Flow {
  namespace Custom {
    interface Properties {}

    namespace Plugin {
      interface Options {}
    }
  }

  namespace Plugin {
    type Dependecie = {
      name: string;
      package: string;
    };

    namespace Internal {
      type Options = {
        context: Flow.Instance;
        name: string;
        package: string;
        dependencies: Array<Flow.Plugin.Dependecie>;
      } & Flow.Custom.Plugin.Options;
    }

    namespace External {
      type Options = {
        name: string;
        package: string;
        dependencies: Array<Flow.Plugin.Dependecie>;
      } & Flow.Custom.Plugin.Options;
    }
  }

  type Plugins = Array<{ name: string; package: string }>;

  type Instance = {
    name: string;
    version: string;

    plugins(): Plugins;

    use(Plugin: typeof APlugin, options: Flow.Plugin.External.Options): void;
  } & Flow.Custom.Properties;

  type Options = {
    name?: string;
    version?: string;
  };
}

export class APlugin {
  name: string;
  protected context: Flow.Instance;
  package: string;
  protected dependencies: Array<Flow.Plugin.Dependecie>;
  dependeciesCheck: boolean;
  constructor(options: Flow.Plugin.Internal.Options) {
    this.name = options.name;
    this.context = options.context;
    this.dependencies = options.dependencies;
    this.package = options.package;

    const PLUGIN = this;
    const FLOW = this.context;

    function checkDependencies(): boolean {
      const PLUGINS = FLOW.plugins();
      let missedDependencies: Array<Flow.Plugin.Dependecie> = [];

      for (let index = 0; index < PLUGIN.dependencies.length; index++) {
        let dependecie = PLUGIN.dependencies[index];

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

export function createFlow(
  options: Flow.Options = { name: "FlowRage Gamemode", version: "0.0.1" }
): Flow.Instance {
  let flow: Flow.Instance = Object.create({
    name: options.name,
    version: options.version,
    plugins: (): Flow.Plugins => {
      const reserved = ["name", "version", "plugins", "use"];
      let result: Flow.Plugins = [];

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
    use: (
      Plugin: typeof APlugin,
      options: Flow.Plugin.External.Options
    ): Flow.Instance => {
      const plug = new Plugin({
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

      return flow;
    },
  });

  return flow;
}
