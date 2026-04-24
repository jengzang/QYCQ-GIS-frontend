from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET
from zipfile import ZipFile

XML_NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
ROOT_DIR = Path(__file__).resolve().parents[1]
INPUT_WORKBOOK = ROOT_DIR / "data" / "Village.xlsx"
OUTPUT_DIR = ROOT_DIR / "public" / "mock"

PROVINCE_BOUNDS_MAPPING = {
    "min_lat": 20.2,
    "max_lat": 25.6,
    "min_lng": 109.6,
    "max_lng": 117.3,
}

CITY_ANCHOR_MAPPING = {
    "肇庆市": (112.47, 23.05),
    "__default__": (112.47, 23.05),
}

DIALECT_KEYWORD_MAPPING = [
    ("客家方言", ("客家",)),
    ("广宁话", ("广宁",)),
    ("德庆话", ("德庆",)),
    ("高要话", ("高要",)),
    ("封川话", ("封川",)),
    ("开建话", ("开建",)),
    ("粤方言其他", ("粤",)),
]

TIMELINE_ERA_MAPPING = {
    "明代": 1500,
    "明朝": 1500,
    "明末": 1630,
    "明末清初": 1644,
    "民国初期": 1912,
    "民国时期": 1912,
    "清代": 1700,
    "清初": 1650,
    "清咸丰年间": 1851,
    "清嘉庆年间": 1800,
    "清康熙年间": 1680,
    "清朝": 1700,
    "清朝中期": 1750,
    "清朝末年": 1900,
    "清代中期": 1750,
    "清乾隆年间": 1750,
    "清光绪年间": 1880,
    "清末": 1900,
    "清道光年间": 1830,
}


@dataclass(frozen=True)
class FakePoint:
    lng: float
    lat: float


def normalize_text(value: Any) -> str:
    return "" if value is None else str(value).strip()


def fnv1a_32(value: str) -> str:
    hash_value = 0x811C9DC5

    for byte in value.encode("utf-8"):
        hash_value ^= byte
        hash_value = (hash_value * 0x01000193) & 0xFFFFFFFF

    return f"{hash_value:08x}"


def build_primaryid(city: str | None, town: str | None, name: str | None) -> str:
    seed = "|".join([normalize_text(city), normalize_text(town), normalize_text(name)])
    return f"vlg-{fnv1a_32(seed)}"


def resolve_dialect_group(text: str | None) -> str:
    normalized = normalize_text(text)

    if not normalized:
        return "未填写/其他"

    for group, keywords in DIALECT_KEYWORD_MAPPING:
        if any(keyword in normalized for keyword in keywords):
            return group

    return "未填写/其他"


def parse_timeline_sort_year(label: str | None) -> int | None:
    normalized = normalize_text(label)

    if not normalized:
        return None

    year_match = re.search(r"(1[0-9]{3}|20[0-9]{2})", normalized)
    if year_match:
        return int(year_match.group(1))

    for era, sort_year in TIMELINE_ERA_MAPPING.items():
        if era in normalized:
            return sort_year

    return None


def stable_ratio(seed: str, salt: str) -> float:
    return int(fnv1a_32(f"{seed}|{salt}"), 16) / 0xFFFFFFFF


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def derive_fake_point(city: str | None, town: str | None, name: str | None) -> FakePoint:
    seed = "|".join([normalize_text(city), normalize_text(town), normalize_text(name)])
    anchor_lng, anchor_lat = CITY_ANCHOR_MAPPING.get(
        normalize_text(city),
        CITY_ANCHOR_MAPPING["__default__"],
    )

    lng_offset = (stable_ratio(seed, "lng") - 0.5) * 1.2
    lat_offset = (stable_ratio(seed, "lat") - 0.5) * 0.9

    return FakePoint(
        lng=round(
            clamp(
                anchor_lng + lng_offset,
                PROVINCE_BOUNDS_MAPPING["min_lng"],
                PROVINCE_BOUNDS_MAPPING["max_lng"],
            ),
            6,
        ),
        lat=round(
            clamp(
                anchor_lat + lat_offset,
                PROVINCE_BOUNDS_MAPPING["min_lat"],
                PROVINCE_BOUNDS_MAPPING["max_lat"],
            ),
            6,
        ),
    )


def column_index(cell_reference: str) -> int:
    letters = "".join(character for character in cell_reference if character.isalpha())
    index = 0

    for letter in letters:
        index = index * 26 + (ord(letter.upper()) - 64)

    return index - 1


def shared_strings_from_archive(archive: ZipFile) -> list[str]:
    shared_strings_xml = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    shared_strings: list[str] = []

    for node in shared_strings_xml.findall("main:si", XML_NS):
        shared_strings.append(
            "".join(text_node.text or "" for text_node in node.iterfind(".//main:t", XML_NS))
        )

    return shared_strings


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    value_node = cell.find("main:v", XML_NS)
    if value_node is None or value_node.text is None:
        return ""

    if cell.attrib.get("t") == "s":
        return shared_strings[int(value_node.text)]

    return value_node.text


def read_workbook_rows(workbook_path: Path) -> list[dict[str, str]]:
    with ZipFile(workbook_path) as archive:
        shared_strings = shared_strings_from_archive(archive)
        sheet_xml = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows = sheet_xml.find("main:sheetData", XML_NS).findall("main:row", XML_NS)

    header_cells = rows[0].findall("main:c", XML_NS)
    header_map = {
        column_index(cell.attrib["r"]): normalize_text(cell_value(cell, shared_strings))
        for cell in header_cells
    }
    headers = [header_map[index] for index in sorted(header_map)]

    output_rows: list[dict[str, str]] = []

    for row in rows[1:]:
        cell_map: dict[int, str] = {}
        for cell in row.findall("main:c", XML_NS):
            cell_map[column_index(cell.attrib["r"])] = normalize_text(
                cell_value(cell, shared_strings)
            )

        output_rows.append(
            {header: cell_map.get(index, "") for index, header in enumerate(headers)}
        )

    return output_rows


def clean_optional_text(value: str | None) -> str | None:
    normalized = normalize_text(value)
    return normalized or None


def build_search_text(row: dict[str, str]) -> str:
    fields = [
        row.get("归属市", ""),
        row.get("归属镇", ""),
        row.get("村名", ""),
        row.get("位置", ""),
        row.get("村名来源", ""),
        row.get("村居民使用语言情况", ""),
        row.get("居民民族", ""),
        row.get("村经济情况", ""),
    ]
    return " ".join(field for field in fields if field)


def build_village_record(row: dict[str, str]) -> dict[str, Any]:
    primaryid = build_primaryid(row.get("归属市"), row.get("归属镇"), row.get("村名"))
    point = derive_fake_point(row.get("归属市"), row.get("归属镇"), row.get("村名"))
    sort_year = parse_timeline_sort_year(row.get("建村时间"))

    return {
        "primaryid": primaryid,
        "name": row.get("村名", ""),
        "city": row.get("归属市") or "",
        "town": row.get("归属镇") or "",
        "economy": clean_optional_text(row.get("村经济情况")),
        "ethnicity": clean_optional_text(row.get("居民民族")),
        "geometry": {
            "type": "Point",
            "coordinates": [point.lng, point.lat],
        },
        "raw": row,
        "searchText": build_search_text(row),
        "dialectGroup": resolve_dialect_group(row.get("村居民使用语言情况")),
        "timeline": {
            "rawLabel": row.get("建村时间") or "",
            "sortYear": sort_year,
        },
    }


def build_facets(records: list[dict[str, Any]]) -> dict[str, Any]:
    cities = sorted({record["city"] for record in records if record["city"]})
    towns = sorted({record["town"] for record in records if record["town"]})
    dialect_groups = sorted({record["dialectGroup"] for record in records})
    economies = sorted({record["economy"] for record in records if record.get("economy")})
    ethnicities = sorted({record["ethnicity"] for record in records if record.get("ethnicity")})
    sort_years = [
        record["timeline"]["sortYear"]
        for record in records
        if record["timeline"]["sortYear"] is not None
    ]

    return {
        "cities": cities,
        "towns": towns,
        "dialectGroups": dialect_groups,
        "economies": economies,
        "ethnicities": ethnicities,
        "timelineRange": {
            "min": min(sort_years) if sort_years else None,
            "max": max(sort_years) if sort_years else None,
        },
    }


def write_mock_files(records: list[dict[str, Any]]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "villages.json").write_text(
        json.dumps(records, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (OUTPUT_DIR / "facets.json").write_text(
        json.dumps(build_facets(records), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def main() -> None:
    rows = read_workbook_rows(INPUT_WORKBOOK)
    records = [build_village_record(row) for row in rows]
    write_mock_files(records)
    print(f"Generated {len(records)} village records")


if __name__ == "__main__":
    main()
