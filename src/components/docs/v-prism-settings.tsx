import { vPrismSettings } from "./v-prism-settings-data";

export function VPrismSettings() {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-border bg-background">
      <div className="hidden grid-cols-[minmax(9rem,0.85fr)_minmax(0,2fr)_auto] gap-6 bg-muted/50 px-5 py-3 text-xs font-medium text-muted-foreground md:grid">
        <span>Setting</span>
        <span>What it controls</span>
        <span>Reference range</span>
      </div>
      <dl>
        {vPrismSettings.map((setting, index) => (
          <div
            key={setting.name}
            className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-3.5 md:grid-cols-[minmax(9rem,0.85fr)_minmax(0,2fr)_auto] md:items-center md:gap-6 md:px-5 ${index > 0 ? "border-t border-border" : ""}`}
          >
            <dt className="min-w-0 font-mono text-xs font-medium text-foreground sm:text-sm">
              {setting.name}
            </dt>
            <dd className="col-span-2 text-sm leading-6 text-muted-foreground md:col-span-1">
              {setting.description}
            </dd>
            <dd className="col-start-2 row-start-1 self-start whitespace-nowrap rounded-lg border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground md:col-auto md:row-auto md:self-center">
              {setting.range}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
