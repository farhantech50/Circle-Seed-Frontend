import { useEffect, useMemo, useRef, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import useLookUp from "../hooks/useLookup";
import showToast from "../utils/toast";
import { BiXCircle } from "react-icons/bi";

const Lookup = ({
  selectedId,
  setSelectedId,
  lookupName,
  isMultiple = false,
}) => {
  const { getLookup } = useLookUp();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [lookupItems, setLookupItems] = useState([]);

  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchLookup = async () => {
      if (!lookupName) {
        setLookupItems([]);
        return;
      }
      try {
        const response = await getLookup(lookupName);

        if (response?.success) {
          const formatted = Array.isArray(response.data)
            ? response.data.map((item) => ({
                id: item.id,
                value: item.value,
              }))
            : [];

          setLookupItems(formatted);
        }
      } catch {
        showToast("Failed to load data", "error");
        setLookupItems([]);
      }
    };

    fetchLookup();
  }, [lookupName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return lookupItems;

    return lookupItems.filter((item) =>
      item.value.toLowerCase().includes(search.toLowerCase()),
    );
  }, [lookupItems, search]);

  const isSelected = (id) => {
    if (isMultiple) {
      return selectedId?.includes(id);
    }

    return String(selectedId ?? "") === String(id ?? "");
  };

  const toggleSelect = (id) => {
    if (isMultiple) {
      if (!selectedId) {
        setSelectedId([id]);
        return;
      }

      if (selectedId.includes(id)) {
        setSelectedId(selectedId.filter((x) => x !== id));
      } else {
        setSelectedId([...selectedId, id]);
      }
    } else {
      setSelectedId(id);
      setOpen(false);
      setSearch("");
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();

    if (isMultiple) {
      setSelectedId([]);
    } else {
      setSelectedId("");
    }
  };

  const hasSelection = isMultiple
    ? selectedId?.length > 0
    : selectedId !== "" && selectedId !== null && selectedId !== undefined;

  const selectedValue = () => {
    if (isMultiple) {
      const selected = lookupItems.filter((x) => selectedId?.includes(x.id));

      if (!selected.length) return "Select option";

      return (
        <div className="flex flex-wrap gap-1">
          {selected.map((item) => (
            <span
              key={item.id}
              className="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700"
            >
              {item.value}
            </span>
          ))}
        </div>
      );
    }

    return (
      lookupItems.find((x) => String(x.id) === String(selectedId))?.value ||
      "Select option"
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        onClick={() => {
          if (open) setSearch("");
          setOpen(!open);
        }}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
      >
        <span className="truncate">{selectedValue()}</span>

        <div className="flex items-center gap-2">
          {hasSelection && (
            <BiXCircle
              size={18}
              className="text-gray-400 hover:text-red-500"
              onClick={clearSelection}
            />
          )}

          <FaChevronDown />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          <div className="border-b p-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No options found</div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-primary-50"
                >
                  <span>{item.value}</span>

                  {isSelected(item.id) && (
                    <FaCheck className="text-primary-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lookup;
