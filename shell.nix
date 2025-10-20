
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.python311
    pkgs.python311Packages.pip
    (pkgs.python311.withPackages (ps: [
      ps.flask
      ps.python-dotenv
      ps.openai
      ps.web3
      ps.pillow
      ps.werkzeug
    ]))
  ];
}
