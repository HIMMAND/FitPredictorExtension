from __future__ import annotations

import json
import sys
from pathlib import Path

metrics = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
for target, values in metrics.items():
    print(f"{target}: MAE={values['mae']:.3f}, R2={values['r2']:.3f}")
