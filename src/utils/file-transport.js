import build from "pino-abstract-transport";
import SonicBoom from "sonic-boom";
import { once } from "events";

export default async function (opts) {
  const destination = new SonicBoom({
    dest: opts.destination || "./logs/app.log",
    sync: false,
  });

  console.log({destination})
  await once(destination, "ready");

  return build(
    async function (source) {
      for await (let obj of source) {
        const toDrain = !destination.write(obj.msg + "\n");
        if (toDrain) {
          await once(destination, "drain");
        }
      }
    },
    {
      async close() {
        destination.end();
        await once(destination, "close");
      },
    }
  );
}
