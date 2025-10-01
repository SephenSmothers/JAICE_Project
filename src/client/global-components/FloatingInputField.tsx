export function FloatingInputField({
  label,
  type,
  value,
  action,
}: {
  label: string;
  type: string;
  value: string;
  action: (value: string) => void;
}) {
  const inputID = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="relative">
      <input
        type={type}
        id={inputID}
        className={`
        block 
        px-2.5 
        pb-2.5 
        pt-4 
        w-full 
        text-sm 
        text-[var(--color-blue-5)] 
        bg-transparent 
        rounded-lg 
        border-1 
        border-[var(--color-blue-4)]
        appearance-none 
        focus:outline-none 
        focus:ring-0 
        focus:border-[var(--color-blue-5)]
        peer
        `}
        placeholder=" "
        value={value}
        onChange={(e) => {
          action(e.target.value);
        }}
      />
      <label
        htmlFor={inputID}
        className={`
        absolute 
        text-sm 
        text-[var(--color-blue-4)]
        duration-300 
        transform 
        -translate-y-4 
        scale-75 
        top-2 
        z-10 
        origin-[0] 
        bg-rgba(var(--color-blue-5-rgb), 0.1)
        backdrop-blur-xl
        px-2 
        peer-focus:px-2 
        peer-focus:text-[var(--color-blue-5)] 
        peer-placeholder-shown:scale-100 
        peer-placeholder-shown:-translate-y-1/2 
        peer-placeholder-shown:top-1/2 
        peer-focus:top-2 
        peer-focus:scale-75 
        peer-focus:-translate-y-4 
        rtl:peer-focus:translate-x-1/4 
        rtl:peer-focus:left-auto 
        start-1
        `}
      >
        {label}
      </label>
    </div>
  );
}
