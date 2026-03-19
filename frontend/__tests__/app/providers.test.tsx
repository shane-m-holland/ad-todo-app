import { Providers } from "@/app/providers";
import { useQueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

// Create a test component that uses the query client
function TestComponent() {
  const queryClient = useQueryClient();
  return (
    <div>
      {queryClient ? "QueryClient Available" : "QueryClient Not Available"}
    </div>
  );
}

describe("Providers", () => {
  it("should render children", () => {
    render(
      <Providers>
        <div>Test Child</div>
      </Providers>,
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("should provide QueryClient to children", () => {
    render(
      <Providers>
        <TestComponent />
      </Providers>,
    );

    expect(screen.getByText("QueryClient Available")).toBeInTheDocument();
  });

  it("should render multiple children", () => {
    render(
      <Providers>
        <div>Child 1</div>
        <div>Child 2</div>
      </Providers>,
    );

    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });
});
