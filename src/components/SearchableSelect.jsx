import { useState, useRef, useEffect, useMemo } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import { BiXCircle } from "react-icons/bi";

const SearchableSelect = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  getOptionLabel = (option) => option.label,
  getOptionValue = (option) => option.value,
  isMultiple = false,
  menuPlacement = "bottom",
  disabled = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;

    return options.filter((opt) => {
      const label = getOptionLabel(opt) || "";
      return label.toString().toLowerCase().includes(search.toLowerCase());
    });
  }, [options, search, getOptionLabel]);

  const isSelected = (optValue) => {
    if (isMultiple) {
      return (Array.isArray(value) ? value : []).includes(optValue);
    }
    return String(value ?? "") === String(optValue ?? "");
  };

  const handleSelect = (optValue) => {
    if (disabled) return;
    if (isMultiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optValue)) {
        onChange(currentValues.filter((v) => v !== optValue));
      } else {
        onChange([...currentValues, optValue]);
      }
    } else {
      onChange(optValue);
      setDropdownOpen(false);
      setSearch("");
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled) return;
    onChange(isMultiple ? [] : "");
    setSearch("");
  };

  const hasSelection = isMultiple
    ? value?.length > 0
    : value !== "" && value !== null && value !== undefined;

  const selectedValueRender = () => {
    if (isMultiple) {
      const selected = options.filter((opt) => (Array.isArray(value) ? value : []).includes(getOptionValue(opt)));

      if (!selected.length) return placeholder;

      return (
        <div className="flex flex-wrap gap-1">
          {selected.map((item) => (
            <span
              key={getOptionValue(item)}
              className="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700"
            >
              {getOptionLabel(item)}
            </span>
          ))}
        </div>
      );
    }

    const selectedOpt = options.find((opt) => String(getOptionValue(opt)) === String(value));
    return selectedOpt ? getOptionLabel(selectedOpt) : placeholder;
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (dropdownOpen) setSearch("");
          setDropdownOpen(!dropdownOpen);
        }}
        className={`flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm transition ${
          disabled ? "bg-slate-100 text-slate-500 cursor-not-allowed opacity-90" : "bg-white text-slate-800"
        }`}
      >
        <span className="truncate">{selectedValueRender()}</span>

        <div className="flex items-center gap-2">
          {hasSelection && !disabled && (
            <BiXCircle
              size={18}
              className="text-gray-400 hover:text-red-500"
              onClick={clearSelection}
            />
          )}

          <FaChevronDown className={disabled ? "text-slate-400" : "text-slate-600"} />
        </div>
      </button>

      {dropdownOpen && !disabled && (
        <div
          className={`absolute z-50 w-full rounded-md border bg-white shadow-lg ${
            menuPlacement === "top" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          <div className="border-b p-2">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const optValue = getOptionValue(opt);
                return (
                  <div
                    key={optValue}
                    onClick={() => handleSelect(optValue)}
                    className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-primary-50"
                  >
                    <span>{getOptionLabel(opt)}</span>

                    {isSelected(optValue) && (
                      <FaCheck className="text-primary-600" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
